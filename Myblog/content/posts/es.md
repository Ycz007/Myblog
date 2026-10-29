---
title: "Elasticsearch 入门：倒排索引、分词与中文搜索"
date: "2026-10-29"
description: "从 MySQL LIKE 的边界出发，理解倒排索引和 Analyzer，并通过 IK 与拼音配置梳理中文搜索的完整链路。"
tags: ["Elasticsearch", "MySQL", "搜索"]
---

搜索功能不只是判断“字符串里有没有某个词”，还要处理分词、相关性、筛选和用户输入习惯。本文围绕三个问题展开：

1. 什么情况下需要 Elasticsearch，而不是继续使用 MySQL？
2. 倒排索引为什么适合全文搜索？
3. 一段文本如何经过分词，变成可以检索的词项？

## 1. 为什么用 Elasticsearch 搜索？

Elasticsearch（下文简称 ES）适合全文检索，但不是所有查询都需要它。先看普通 `LIKE` 能做到什么，以及它的边界。

### 1.1 前导通配符不利于 B+Tree 范围定位

查询标题中包含“苹果”的商品：

```sql
SELECT id, title
FROM phone
WHERE title LIKE '%苹果%';
```

普通 B+Tree 索引按索引键排序，适合等值、范围和符合条件的前缀查询：

```sql
-- 有确定的前缀，有机会使用索引范围扫描
WHERE title LIKE '苹果%'

-- 前缀不确定，不能靠这个条件确定普通索引的查找范围
WHERE title LIKE '%苹果%'
```

后者往往需要扫描较多记录。但“不能利用该条件做范围定位”不等于“一定全表扫描”：其他过滤条件、覆盖索引和优化器选择都会影响执行计划，应使用 `EXPLAIN` 验证。

参考：[MySQL 范围优化](https://dev.mysql.com/doc/refman/8.4/en/range-optimization.html)。

### 1.2 LIKE 不会自动理解关键词

假设原文是：

```text
苹果 iPhone 15 手机支持快速充电
```

下面的条件要求原文包含连续的“苹果 快充”，包括中间的空格，因此无法匹配上述文本：

```sql
WHERE title LIKE '%苹果 快充%'
```

ES 对 `text` 字段执行 `match` 查询时，会先分析输入，再用生成的词项检索。但它也不会天然知道“快速充电”和“快充”同义，通常需要配置同义词规则或在业务侧处理。

**分词负责切分文本，同义词负责建立词语之间的对应关系。**

### 1.3 搜索需要相关性排序

`LIKE` 条件主要判断匹配与否，并不直接提供全文相关性分数。

ES 的普通全文检索可以通过 `_score` 排序，默认相似度模型是 BM25。词频、词项在文档集合中的稀有程度、字段长度等都会影响评分。字段权重需要通过查询配置体现；短语和词序要求则需要相应的查询方式。

例如，希望“标题命中”比“描述命中”更重要，可以给标题字段更高的权重，而不是只按发布时间排列所有结果。

参考：[ES 相似度设置](https://www.elastic.co/docs/reference/elasticsearch/index-settings/similarity)。

### 1.4 MySQL 也有全文索引

不能把“`LIKE` 的限制”扩大为“MySQL 完全没有全文搜索能力”。

MySQL 提供 `FULLTEXT` 索引以及 `MATCH ... AGAINST` 查询，也支持面向中日韩文本的 ngram 全文解析器。是否引入 ES，应比较实际需求和维护成本，而不是只看数据量。

参考：[MySQL 全文搜索](https://dev.mysql.com/doc/refman/8.4/en/fulltext-search.html)。

| 需求 | 可优先考虑 |
| --- | --- |
| 按订单号、用户 ID 等精确查询 | MySQL 与合适的索引 |
| 简单的名称包含查询 | 先评估 MySQL LIKE 的实际执行成本 |
| 基础全文搜索，希望减少系统组件 | 评估 MySQL FULLTEXT |
| 中文分词、字段权重、拼音召回、高亮和复杂搜索组合 | 评估 ES |
| 日志检索、多维聚合和分布式搜索 | 评估 ES，并做容量规划和压测 |

引入 ES 还意味着需要维护额外服务、索引和数据同步。业务系统常见的做法是以 MySQL 保存业务数据，再把需要搜索的内容同步到 ES。同步与索引刷新可能存在延迟，需要在设计中考虑。

## 2. 正排视角与倒排索引

### 2.1 从文档找内容

以文档为入口查看数据：

```text
文档 1 → 苹果手机支持快速充电
文档 2 → 华为手机拍照效果很好
文档 3 → 苹果电脑适合开发使用
```

这可以称为“正排视角”。这里描述的是数据访问方向，**不等于 MySQL 的 B+Tree 索引结构**。

如果没有合适的检索索引，要找出包含某些词的文档，就可能需要逐条检查内容。

### 2.2 从词项找文档

倒排索引反过来组织信息。假设文本已经切出以下词项：

```text
苹果 → [1, 3]
手机 → [1, 2]
快速 → [1]
充电 → [1]
华为 → [2]
电脑 → [3]
```

搜索“苹果 手机”时，可以先找到两个文档列表：

```text
苹果：[1, 3]
手机：[1, 2]

要求两个词都命中：取交集 → [1]
允许任意词命中：取并集 → [1, 2, 3]
```

这是理解检索逻辑的简化模型。真实执行还会涉及字段、过滤条件、评分和执行优化。

对本文的普通 `text` 字段，`match` 默认使用 OR 逻辑；需要所有分析后的词项都匹配时，可以指定 `operator: "and"`。注意，AND 只要求都匹配，不要求词项相邻或顺序相同。

参考：[ES match 查询](https://www.elastic.co/docs/reference/query-languages/query-dsl/query-dsl-match-query)。

### 2.3 倒排索引不只有文档 ID

可以把它理解成“词项词典 + 每个词项对应的倒排列表”。根据字段配置，还可能保存：

| 信息 | 用途 |
| --- | --- |
| 文档 ID | 定位包含词项的文档 |
| 词频 | 参与相关性评分 |
| 词项位置 | 支持短语、邻近等查询 |
| 字符偏移量 | 可供高亮等操作使用 |

这些信息按字段组织；同一个词在 `title` 和 `description` 中出现，并不是同一个字段的索引记录。高亮如何取得位置和偏移量，也取决于字段配置与高亮器，并非默认总从倒排列表读取。

## 3. Analyzer：文本分析的三个阶段

一个 Analyzer 由以下部分组成：

```text
原始文本
   ↓
Character Filters：零个或多个，处理字符
   ↓
Tokenizer：恰好一个，切分文本
   ↓
Token Filters：零个或多个，处理词项
   ↓
Token 流
```

Token 不只是一个字符串，还带有位置、偏移量等信息。下面的列表为了便于理解，只展示词项文本。

参考：[Analyzer 的组成](https://www.elastic.co/docs/manage-data/data-store/text-analysis/anatomy-of-an-analyzer)。

### 3.1 Character Filter：处理原始字符

它在切词之前处理文本，例如移除 HTML 标签或按规则替换字符。

```text
原始文本：
<p>Apple 苹果手机 & 快速充电</p>

配置 HTML 清理后，示意结果：
Apple 苹果手机 & 快速充电
```

如果还希望把 `&` 变成 `and`，需要额外配置相应替换规则。去 HTML 标签和字符替换不是自动绑定的行为。

### 3.2 Tokenizer：把文本切成词项

假设使用中文分词器，结果可能包含：

```text
[Apple, 苹果, 手机, 快速, 充电]
```

**这是示意，不是保证的输出。** 具体结果取决于分词器、词典、版本和分词模式。符号是否保留，也要查看实际分析结果。

IK 是可选的第三方中文分词插件。常用模式有：

- `ik_max_word`：通常切分得更细，可能生成更多词项。
- `ik_smart`：通常生成较粗粒度的切分。

可以尝试索引时使用前者、搜索时使用后者，但应根据真实查询评估效果，不是固定的最佳配置。

参考：[IK 插件说明](https://github.com/infinilabs/analysis-ik)。

### 3.3 Token Filter：加工已有词项

不同过滤器负责不同工作：

| 处理 | 示例 | 前提 |
| --- | --- | --- |
| 小写化 | `Apple → apple` | 配置 lowercase |
| 去停用词 | 删除指定的 `and` 等词 | 配置 stop 和停用词表 |
| 同义词 | 建立“快充”与“快速充电”的关系 | 配置同义词规则 |
| 拼音转换 | `苹果 → ping / guo / pingguo / pg` | 安装并配置拼音插件 |

需要特别区分：

- 拼音过滤器不会把英文 `Apple` 翻译成中文“苹果”。
- 拼音过滤器不会自动建立“快速充电”和“快充”的同义关系。
- Tokenizer 不一定删除 `and`，去停用词通常需要明确配置。
- 中文原词、完整拼音和首字母是否保留，取决于插件选项。

参考：[拼音插件说明](https://github.com/infinilabs/analysis-pinyin)。

### 3.4 索引时与搜索时都可能进行分析

```text
写入文档 → 索引分析器 → 词项 → 建立倒排索引
用户输入 → 搜索分析器 → 词项 → 查询倒排索引
```

两端不一定使用相同分析器，但结果需要能够匹配。例如，只给中文字段建立了中文词项，用户直接搜索 `pg`，并不会自动匹配“苹果”。

## 4. 实战：中文、拼音与精确匹配分字段处理

同一个名称可以使用多字段：

| 字段 | 类型 | 主要用途 |
| --- | --- | --- |
| `name` | text | 中文全文检索 |
| `name.pinyin` | text | 拼音或首字母召回 |
| `name.keyword` | keyword | 完整名称精确匹配、排序或聚合 |

它们来自同一份 `name` 原始值，不需要在写入文档时分别赋值。

### 4.1 创建索引

以下请求采用 Kibana Dev Tools 格式。运行前需要在相关 ES 节点安装与版本兼容的 IK 和拼音插件；未安装时，ES 无法识别相应 tokenizer 或 filter。示例索引名为 `demo_user_v2`，请在不存在同名索引的测试环境执行。

```http
PUT /demo_user_v2
{
  "settings": {
    "analysis": {
      "analyzer": {
        "ik_index_analyzer": {
          "type": "custom",
          "tokenizer": "ik_max_word",
          "filter": ["lowercase"]
        },
        "ik_search_analyzer": {
          "type": "custom",
          "tokenizer": "ik_smart",
          "filter": ["lowercase"]
        },
        "pinyin_analyzer": {
          "type": "custom",
          "tokenizer": "ik_max_word",
          "filter": ["my_pinyin", "lowercase"]
        }
      },
      "filter": {
        "my_pinyin": {
          "type": "pinyin",
          "keep_first_letter": true,
          "keep_separate_first_letter": false,
          "keep_full_pinyin": true,
          "keep_joined_full_pinyin": true,
          "keep_original": false,
          "limit_first_letter_length": 16,
          "lowercase": true,
          "remove_duplicated_term": true
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "ik_index_analyzer",
        "search_analyzer": "ik_search_analyzer",
        "fields": {
          "pinyin": {
            "type": "text",
            "analyzer": "pinyin_analyzer"
          },
          "keyword": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

这份配置保留了原笔记的分析器组合，但需要明确它的边界：

- `name` 的索引分析器和搜索分析器分别指定。
- `name.pinyin` 未单独指定搜索分析器，常规全文查询默认使用该子字段的分析器。
- `keep_original: false` 不保留拼音转换前的中文词项；中文检索仍可走主字段 `name`。
- 这里没有配置 Character Filter、停用词或同义词处理，不能期待它们自动发生。
- 此配置偏向拼音召回，不等于完成了前缀补全或精确短语搜索。拼音重音、同音和词项位置还可能影响准确性，需单独评估。

### 4.2 先用 _analyze 看结果

不要仅凭配置名称推断会生成哪些词项。分别查看中文分析器、拼音分析器以及用户输入的实际输出：

```http
POST /demo_user_v2/_analyze
{
  "analyzer": "ik_index_analyzer",
  "text": "Apple 苹果手机支持快速充电",
  "explain": true
}
```

```http
POST /demo_user_v2/_analyze
{
  "analyzer": "pinyin_analyzer",
  "text": "苹果",
  "explain": true
}
```

```http
POST /demo_user_v2/_analyze
{
  "analyzer": "pinyin_analyzer",
  "text": "pg",
  "explain": true
}
```

重点对比词项文本与位置：索引“苹果”时生成的词项，是否与查询“pg”时生成的词项有交集？具体输出以当前安装版本的实际结果为准。

### 4.3 写入文档，再验证查询

```http
PUT /demo_user_v2/_doc/1?refresh=wait_for
{
  "name": "苹果手机"
}
```

`refresh=wait_for` 用于在这个演示中等待写入对搜索可见。

中文查询：

```http
GET /demo_user_v2/_search
{
  "query": {
    "match": {
      "name": {
        "query": "苹果 手机",
        "operator": "and"
      }
    }
  }
}
```

拼音首字母查询：

```http
GET /demo_user_v2/_search
{
  "query": {
    "match": {
      "name.pinyin": "pg"
    }
  }
}
```

这个查询能否命中，取决于前一步确认的分析结果，不能只凭“安装了拼音插件”判断。

完整名称精确匹配：

```http
GET /demo_user_v2/_search
{
  "query": {
    "term": {
      "name.keyword": "苹果手机"
    }
  }
}
```

这里使用 `keyword` 字段保留完整名称，不把它拆成多个中文词项。

## 5. 搜不到时，按链路排查

1. **确认查的是哪个字段。** 中文字段、拼音字段和 keyword 字段用途不同。
2. **检查索引端词项。** 用 `_analyze` 查看文档文本实际如何被处理。
3. **检查查询端词项。** 同样分析用户输入，确认两端能匹配。
4. **检查查询条件。** OR、AND、短语要求和过滤条件都可能改变结果。
5. **检查文档可见性。** 写入成功与已经可以被搜索到，不是同一个时刻。
6. **检查索引是否重建。** 调整分析规则通常不会自动重写已建立的倒排索引，需要按变更类型规划重建或重新索引。

理解 ES 搜索时，始终沿着“原始文本 → 分析后的词项 → 字段索引 → 查询与评分”这条链路思考。配置只能描述处理规则，实际词项和查询结果才是验证依据。


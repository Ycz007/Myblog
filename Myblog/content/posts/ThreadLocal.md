---
title: "ThreadLocal：线程隔离、请求上下文与内存泄漏"
date: "2026-09-20"
description: "梳理 Thread、ThreadLocal 与 ThreadLocalMap 的关系，以及请求上下文的使用方式和内存泄漏的原因。"
tags: ["Java", "并发", "ThreadLocal"]
---

## Thread、ThreadLocal 与 ThreadLocalMap 的关系

`ThreadLocal` 用于保存与当前线程关联的变量。同一个 `ThreadLocal` 对象可以被多个线程共享，但各线程通过 `get()`、`set()` 访问的是各自绑定的值。

以 OpenJDK 的实现为例，它们之间的关系如下：

- `Thread` 中有一个 `threadLocals` 字段，指向该线程的 `ThreadLocalMap`，未使用时可以为 `null`。
- `ThreadLocalMap` 是 `ThreadLocal` 的静态内部类，内部用 `Entry[]` 保存条目。
- 每个 `Entry` 以 `ThreadLocal` 对象作为键，以该线程绑定的对象作为值；键是弱引用，值是强引用。
- 一个线程可以使用多个 `ThreadLocal`，它们对应同一张 map 中的不同条目。

![Thread、ThreadLocal 与 ThreadLocalMap 的关系](/images/ThreadLocal/threadLocal.png)

下面是 `Thread` 中相关字段的简化示意，并非完整源码：

```java
class Thread {
    // 保存普通 ThreadLocal 对应的值，按需创建。
    ThreadLocal.ThreadLocalMap threadLocals = null;

    // 保存 InheritableThreadLocal 对应的值。
    ThreadLocal.ThreadLocalMap inheritableThreadLocals = null;
}
```

因此，更准确的表述是：**线程通过同一个 ThreadLocal，访问自己关联的值。实际数据保存在当前线程的 ThreadLocalMap 中。**

这里的隔离不意味着自动复制对象。如果两个线程主动将同一个可变对象放入各自的 `ThreadLocal`，它们仍然共享这个对象，仍需考虑并发安全。[Java ThreadLocal API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ThreadLocal.html)

## 使用 ThreadLocal 保存用户上下文

在同步请求处理中，可以用 `ThreadLocal` 保存用户 ID、角色、昵称等信息，方便同一线程中的业务代码读取，减少层层传参。

```java
public final class UserContext {
    private static final ThreadLocal<Long> USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<Integer> ROLE = new ThreadLocal<>();
    private static final ThreadLocal<String> NICKNAME = new ThreadLocal<>();

    private UserContext() {
    }

    public static void set(Long userId, Integer role, String nickname) {
        USER_ID.set(userId);
        ROLE.set(role);
        NICKNAME.set(nickname);
    }

    public static Long getUserId() {
        return USER_ID.get();
    }

    public static Integer getRole() {
        return ROLE.get();
    }

    public static String getNickname() {
        return NICKNAME.get();
    }

    public static void clear() {
        USER_ID.remove();
        ROLE.remove();
        NICKNAME.remove();
    }
}
```

一个需要用户身份的请求，可以按下面的流程处理：

```text
携带 Token 发起请求 → 校验身份 → 写入用户上下文 → 执行业务逻辑 → 清理用户上下文
```

**ThreadLocal 绑定的是线程，不是用户，也不是请求。** Web 容器通常会复用线程：用户 A 的请求结束后，同一个线程可能继续处理用户 B 的请求。如果旧值未清理，且新请求未覆盖相关字段，就可能读到用户 A 的数据。

因此，每次使用上下文都应配对清理，不能把它当作跨请求保存登录状态的容器。

### 在 Spring MVC 拦截器中清理

对于同步 Spring MVC 请求，可以在 `preHandle()` 中写入上下文，在 `afterCompletion()` 中清理。需要注意：

- 方法名是 `preHandle`，不是 `preHandler`。
- 校验通过、允许继续处理时，应返回 `true`；返回 `false` 会中断执行链。
- 只有当前拦截器的 `preHandle()` 正常返回 `true`，框架才会调用它的 `afterCompletion()`。如果在 `preHandle()` 中拒绝请求或抛出异常，需要自行清理。[Spring HandlerInterceptor API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/HandlerInterceptor.html)

以下为拦截器方法示意，省略了类声明、导入和业务认证实现；`AuthenticatedUser`、`authenticate()` 需由项目提供。`authenticate()` 校验失败时返回 `null` 或抛出异常，不能仅解析 Token 而不验证其有效性。

```java
@Override
public boolean preHandle(HttpServletRequest request,
                         HttpServletResponse response,
                         Object handler) throws Exception {
    boolean accepted = false;
    try {
        AuthenticatedUser user = authenticate(request);
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        UserContext.set(user.getId(), user.getRole(), user.getNickname());
        accepted = true;
        return true;
    } finally {
        // 拒绝请求或执行失败时，本拦截器的 afterCompletion 不会被调用。
        if (!accepted) {
            UserContext.clear();
        }
    }
}

@Override
public void afterCompletion(HttpServletRequest request,
                            HttpServletResponse response,
                            Object handler,
                            Exception ex) {
    UserContext.clear();
}
```

这段代码用于说明上下文的生命周期。生产项目的身份认证可交给 Spring Security 等安全框架，`ThreadLocal` 本身不提供认证能力。

### 异步请求的边界

上面的清理方式针对同步请求。Spring MVC 启动异步处理时，原请求线程会先退出，此时不会按同步流程调用 `afterCompletion()`。可通过 `AsyncHandlerInterceptor.afterConcurrentHandlingStarted()` 清理原线程的上下文。[Spring AsyncHandlerInterceptor API](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/AsyncHandlerInterceptor.html)

普通 `ThreadLocal` 不会自动把值传给 `@Async`、`CompletableFuture` 或线程池中的其他线程。异步任务如果需要用户信息，应显式传参，或使用受控的上下文传递机制，并在实际执行任务的线程中完成设置和清理。另一个线程调用 `remove()`，不能清除原线程中的值。

`InheritableThreadLocal` 主要面向创建子线程时的值继承；线程池中的线程通常早已创建，不能用它可靠地传递每次提交任务时的上下文。

## ThreadLocal 的内存泄漏问题

### 为什么键使用弱引用仍可能泄漏？

`ThreadLocalMap.Entry` 的结构可以简化为：

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;

    Entry(ThreadLocal<?> key, Object value) {
        super(key);          // 对 ThreadLocal 的弱引用。
        this.value = value;  // 对具体值的强引用。
    }
}
```

引用关系如下：

```text
Thread ──强引用──> ThreadLocalMap ──强引用──> Entry[] ──强引用──> Entry
                                                               ├──强引用──> value
                                                               └──弱引用──> ThreadLocal（键）
```

当 `ThreadLocal` 对象不再被强引用时，GC 可以回收它，随后 `Entry.get()` 返回 `null`。但这不会自动移除 `Entry`，也不会自动断开它对 `value` 的强引用。

### 泄漏如何发生？

假设在线程池中某个长期存活的工作线程上执行：

```java
ThreadLocal<byte[]> local = new ThreadLocal<>();
local.set(new byte[10 * 1024 * 1024]);
local = null;
```

在没有其他强引用指向该 `ThreadLocal` 的前提下，可能出现以下过程：

1. `local = null` 断开局部变量对 `ThreadLocal` 的强引用，但不会立即触发回收。
2. GC 回收这个 `ThreadLocal` 后，对应条目的键失效。
3. `Entry` 仍可能留在 `ThreadLocalMap` 中，并强引用约 10 MiB 的数组。
4. 如果线程长期存活，且该条目一直没有被清理，数组就会持续占用内存，形成内存泄漏。

不能把最后一步理解成“只要线程不结束，值就永远无法回收”。OpenJDK 会在部分 `get()`、`set()`、`remove()` 执行路径中清理失效条目，但这不是定时清理，也不保证一次操作清除所有失效条目。因此不能依赖这种顺带清理来管理业务数据的生命周期。[OpenJDK ThreadLocal 源码](https://github.com/openjdk/jdk/blob/master/src/java.base/share/classes/java/lang/ThreadLocal.java)

当相应引用链断开，且数组没有其他强引用时，它才具备被 GC 回收的条件；具备回收条件不代表立即释放内存。线程终止后的内部清理也能解除这些线程局部值的引用。

### static final 也不能替代 remove()

前面的 `UserContext` 使用 `static final ThreadLocal`。在类仍正常持有这些字段时，键不会因为局部变量离开作用域就被回收，但各线程中保存的旧值仍可能一直保留，并造成请求之间的数据串用。

所以，无论键是否会被回收，都应在使用结束后主动调用 `remove()`。

## 使用建议

对于能在同一方法中完成的上下文操作，优先用 `try...finally` 保证清理。下面是调用方式示意，其中参数和业务方法由调用方提供：

```java
try {
    UserContext.set(userId, role, nickname);
    executeBusinessLogic();
} finally {
    UserContext.clear();
}
```

- 在设置值的线程中清理，并覆盖正常、异常和提前返回的路径。
- 使用 `remove()` 删除绑定；`set(null)` 只把值设为 `null`，仍会保留当前键对应的条目。
- 跨线程执行时，明确上下文如何传递，以及每个线程何时清理。
- 若存在嵌套上下文，内层结束时通常需要恢复外层值，不能直接套用上述清空方式。

原笔记参考：[小林 coding：Java 并发编程面试题](https://xiaolincoding.com/interview/juc.html#threadlocal)。

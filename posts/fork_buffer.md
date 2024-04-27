---
title: forkはバッファもコピーするのでフラッシュしておこう 
author: abap34
date: 2024/04/23
tag: [Unix, OS, C]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://abap34.com/posts/fork_buffer/image.png
description: forkすると親プロセスのバッファもコピーされるので、フラッシュしないと二重に出力されることがあります。
url: https://abap34.com/posts/fork_buffer.html
site_name: abap34's blog
twitter_site: @abap34
---

## fork関数の挙動

C言語では `fork` 関数を使って `fork(2)` システムコールを呼び出すことができます。

```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if (pid == 0) {
        printf("Hello from child process\n");
    } else {
        printf("Hello from parent process\n");
    }
}
```

```shell
❰yuchi❙~/Desktop/sysprog❱✔≻ gcc fork.c -o fork
❰yuchi❙~/Desktop/sysprog❱✔≻ ./fork
Hello from parent process
Hello from child process
```

こんな感じで親プロセスと子プロセスがそれぞれメッセージを出力してくれます。


ところで、 `fork` したとき、子プロセスには親プロセスのメモリ空間がまんまコピーされます。

```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();

    int x = 123;

    if (pid == 0) {
        printf("Hello from child process! btw x = %d\n", x);
    } else {
        printf("Hello from parent process! btw x = %d\n", x);
    }
}
```

```shell
❰yuchi❙~/Desktop/sysprog❱✘≻ gcc fork.c -o fork
❰yuchi❙~/Desktop/sysprog❱✔≻ ./fork
Hello from parent process! btw x = 123
Hello from child process! btw x = 123
```


では次のコードはどうなるでしょうか

```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    for (size_t i = 0; i < 3; i++)
    {
        printf("hoge");
    }
    
    pid_t pid = fork();

    if (pid == 0) {
        printf("Hello from child %d!\n", getpid());
    } else {
        printf("Hello from parent %d!\n", getpid());
    }
}
```

これの出力はこうなります。
```
❰yuchi❙~/Desktop/sysprog❱✔≻ gcc fork.c -o fork
❰yuchi❙~/Desktop/sysprog❱✔≻ ./fork
hogehogehogeHello from parent 21679!
hogehogehogeHello from child 21680!
```

`hogehogehoge`　が二重に出力されました。

これは `fork` したとき、親プロセスのバッファもコピーされるためです。

`fork` する前にはちゃんと `fflush` しておきましょう。

## 感想

システムプログラミングの講義で先生が話していて試したら確かにそうなってへ〜〜ってなりました


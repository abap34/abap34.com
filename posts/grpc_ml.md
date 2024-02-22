---
title: gRPCを使ったプロセス間通信でGoからいい感じに学習済みモデルを呼び出して推論
author: abap34
date: 2023/09/30
tag: [日記, go, web, 機械学習, python]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/finnish-lapphund/mochilamvan.jpg
description: gRPCを使ったプロセス間通信でGoからいい感じに学習済みモデルを呼び出して推論する話です
url: https://abap34.com/posts/grpc_ml.html
site_name: abap34.com
twitter_site: @abap34
---

 　
## 推論を goでやりたい人がいる

世の中ではGoを使っている人が割と多く、
機械学習の人が一緒に何かやろうと思うとGoを使う必要が割とあります。



となるとPython製のライブラリで作った学習済みモデルをGoからいい感じに呼んで推論する必要があります。


ところが結構な場合、Goでのいい感じの推論は公式にサポートされていません。

前処理系は [gota](https://github.com/go-gota/gota) でそれなりにいけそうというのがわかったのですが、
学習済みモデルを動かす部分は非公式でも全然ちゃんとサポートされているものが出てこなくて厳しい気持ちになります。
(しんどいというよりは、もはやちょっと無理そうという感じ)


なので、gRPCを使って別個建てたPythonのプロセスに対してGoからお願いして推論してもらうことにします。



## 実装
[こちらの記事](https://zenn.dev/hsaki/books/golang-grpc-starting/viewer/intro) をとても参考にさせていただきました。ありがとうございます。
 
こういうファイル構造にします。

```text
├── api
│   └── pred.proto
├── cmd
│   └── server
├── main.go
└── pkg
    └── grpc
```

で、`pred.proto`はこんな感じです。

```proto
// proto3 で書く
syntax = "proto3";

// パッケージ名
package prediction;

// ここにGoの生成されたコードが置かれる
option go_package = "pkg/grpc";

// Prediction というサービスは、Predict というメソッドを持って、PredictはRequestを受け取ってResponseを返す
service Prediction {
  rpc Predict (Request) returns (Response);
}

// Request は input_data というフィールドを持つ
message Request {
  string input_data = 1;
}

// Response は result というフィールドを持つ
message Response {
  string result = 1;
}
```

え、これだけで諸々作ってくれるらしいです。天才？

セットアップして、

```bash
cd src 
go init mypred
sudo apt-get install protobuf-compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2
```

Go用のコードを生成します。

```bash
cd api
protoc --go_out=. --go-grpc_out=. pred.proto
```

Python用のコードを生成します。


```bash
python -m grpc_tools.protoc -I. --python_out=../cmd/server --grpc_python_out=../cmd/server pred.proto
```

こんな感じになります。

```text
├── api
│   └── pred.proto
├── cmd
│   └── server
│       ├── pred_pb2.py
│       ├── pred_pb2_grpc.py
├── main.go
└── pkg
    └── grpc
        ├── pred.pb.go
        └── pred_grpc.pb.go
```

あとはサーバ側をPython, クライアント側をGoで書きます。

### サーバ側

```python
from concurrent import futures
import logging

import grpc
import pred_pb2
import pred_pb2_grpc
from predictor import string_to_df

class PredServicer(pred_pb2_grpc.PredictionServicer):
    def __init__(self):
        pass

    def Predict(self, request, context):
        # == ここで推論する ==
        data_df = string_to_df(request.input_data)
        pred = data_df['x'] + data_df['y']
        pred_str = pred.to_csv(index=False)
        # ==================
        return pred_pb2.Response(result=pred_str)

def serve():
    port = 50051
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pred_pb2_grpc.add_PredictionServicer_to_server(PredServicer(), server)
    server.add_insecure_port('[::]:{}'.format(port))
    server.start()
    print('start server, listening on port {}'.format(port))
    server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig()
    serve()
```

### クライアント側

```go
package main

import (
	"context"
	"log"
	"net/http"
	"io/ioutil"

	"github.com/gorilla/mux"
	"google.golang.org/grpc"
	predpb "mypred/pkg/grpc"
	
)

func PredictHandler(w http.ResponseWriter, r *http.Request) {
	// gRPCサーバーに接続
	adress := "localhost:50051"
	conn, err := grpc.Dial(adress, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}

	defer conn.Close()

	// gRPCクライアントを作成
	c := predpb.NewPredictionClient(conn)

	// リクエストボディを読み込む
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatalf("Failed to read body: %v", err)
	}
	
	// リクエストを作成
	req := &predpb.Request{
		InputData: string(body),
	}

	// リクエストを送信
	res, err := c.Predict(context.Background(), req)
	if err != nil {
		log.Fatalf("Failed to predict: %v", err)
	}

	// レスポンスを返す
	w.Write([]byte(res.Result))
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/predict", PredictHandler)
	http.ListenAndServe(":8080", r)
}
```

これで `main.go` を実行させて、 csvファイルを投げ込むと.....

![](grpc_ml/req.png)

推論結果が返ってきました。笑顔に。


## まとめ
- gRPCでいい感じにPythonで作ったモデルをGoから呼び出せそう
- 機械学習の人は機械学習のことを考えてWebの人はWebできて嬉しそう
- 個人的にはどれくらい速度が出るのか気になります！(テストデータがクソデカなときとか)
  - ので暇になったら調べてみます。

## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/DeGkiItB9d8?si=GFL6bnQBYiDs7uLG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

 
  








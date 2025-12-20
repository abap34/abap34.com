# /// script
# dependencies = [
#     "numpy",
#     "scikit-learn",
# ]
# ///
"""
TF-IDF ベースの記事類似度計算モジュール
"""

import logging
import pathlib
import re
from typing import Any, Dict, List, Tuple, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class TFIDFSimilarityCalculator:
    """TF-IDFベースの記事類似度計算クラス"""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        # デフォルト設定（日本語最適化・類似度多様性重視）
        default_config = {
            "ngram_range": [2, 6],
            "max_features": 15000,
            "min_df": 1,
            "max_df": 0.85,
            "analyzer": "char",
            "sublinear_tf": False,
            "norm": "l2"
        }
        
        # 設定をマージ
        self.config = {**default_config, **(config or {})}
        
        # 日本語用のストップワード（文字n-gramでは使用しないが、将来の拡張用）
        self.japanese_stopwords = {
            'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる', 
            'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる', 'など', 'なっ', 'ない', 
            'この', 'ため', 'その', 'あっ', 'よう', 'また', 'もの', 'という', 'あり', 'まで', 'られ', 
            'なる', 'へ', 'か', 'だ', 'これ', 'によって', 'により', 'おり', 'より', 'による', 'ず', 
            'なり', 'られる', 'において', 'ば', 'なかっ', 'なく', 'しかし', 'について', 'さらに', 
            'また', 'そして', 'それで', 'だから', 'しかし', 'ただし', 'つまり', 'すなわち', 'では', 
            'です', 'である', 'ます', 'ました', 'でき', 'できる', 'いう', 'という', 'といった', 
            'それ', 'あれ', 'どれ', 'これら', 'それら', 'あれら', 'ここ', 'そこ', 'あそこ', 'どこ'
        }
        
        try:
            self.vectorizer = TfidfVectorizer(
                analyzer=self.config["analyzer"],
                ngram_range=tuple(self.config["ngram_range"]),
                min_df=self.config["min_df"],
                max_df=self.config["max_df"],
                max_features=self.config["max_features"],
                sublinear_tf=self.config.get("sublinear_tf", False),
                norm=self.config.get("norm", "l2"),
                token_pattern=None,  # char analyzerでは不要
                smooth_idf=False,  # より強いIDF重み付け
                use_idf=True,      # IDF重み付けを使用
                binary=False,      # TF値を使用
            )
        except Exception as e:
            logger.error(f"TF-IDFベクトライザーの初期化に失敗: {e}")
            raise
            
        self.tfidf_matrix = None
        self.article_ids: List[str] = []
    
    @classmethod
    def from_cache(cls, cache_data: Dict[str, Any]) -> 'TFIDFSimilarityCalculator':
        """キャッシュデータからインスタンスを作成"""
        instance = cls(cache_data.get('tfidf_config', {}))
        instance.tfidf_matrix = cache_data['tfidf_matrix']
        instance.article_ids = cache_data['article_ids']
        instance.vectorizer = cache_data['vectorizer']
        return instance

    def preprocess_text(self, text: str) -> str:
        """日本語テキストの前処理（文字n-gram最適化版）"""
        if not text or not isinstance(text, str):
            return ""
        
        try:
            # HTMLタグとマークダウン記法の除去
            text = re.sub(r'<[^>]+>', '', text)
            text = re.sub(r'#+\s*', '', text)  # ヘッダー
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # 太字
            text = re.sub(r'\*(.*?)\*', r'\1', text)  # イタリック
            text = re.sub(r'`(.*?)`', r'\1', text)  # インラインコード
            text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)  # コードブロック
            text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)  # リンク
            
            # URLと英数字の処理（完全に除去せず、一部保持）
            text = re.sub(r'https?://[^\s]+', ' ', text)  # URL除去
            text = re.sub(r'\b[a-zA-Z]{1,2}\b', ' ', text)  # 短い英語のみ除去
            text = re.sub(r'\b\d{4,}\b', ' ', text)  # 長い数字のみ除去
            
            # 基本的な記号の処理（日本語の文脈を保持）
            text = re.sub(r'[!@#$%^&*()=+\[\]{}|;:\'",.<>?/~`_-]', '', text)
            
            # 空白の正規化
            text = re.sub(r'\s+', '', text)  # 文字n-gramなので空白は不要
            
            # 長さチェック
            if len(text) < 30:
                logger.warning(f"Text short after preprocessing: {len(text)} chars")
            
            logger.debug(f"Preprocessed text length: {len(text)} chars")
            return text
            
        except Exception as e:
            logger.error(f"Text preprocessing failed: {e}")
            return ""

    def extract_text_from_markdown(self, md_path: pathlib.Path) -> str:
        """Markdownファイルからテキストを抽出"""
        try:
            with open(md_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # メタデータ部分を除去（FrontMatter）
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    content = parts[2]
            
            return self.preprocess_text(content)
        except Exception as e:
            logger.error(f"Error reading markdown file {md_path}: {e}")
            return ""

    def build_tfidf_matrix(self, article_contents: Dict[str, str]) -> None:
        """TF-IDF行列を構築"""
        if not article_contents:
            logger.warning("No article contents provided")
            return

        self.article_ids = sorted(list(article_contents.keys()))
        texts = [article_contents[article_id] for article_id in self.article_ids]
        
        # 空のテキストをフィルタリング
        valid_indices = []
        valid_texts = []
        valid_article_ids = []
        
        for i, text in enumerate(texts):
            if text.strip():
                valid_indices.append(i)
                valid_texts.append(text)
                valid_article_ids.append(self.article_ids[i])
        
        if not valid_texts:
            logger.warning("No valid texts found after filtering")
            return
        
        logger.debug(f"Building TF-IDF matrix for {len(valid_texts)} articles")
        
        try:
            self.tfidf_matrix = self.vectorizer.fit_transform(valid_texts)
            self.article_ids = valid_article_ids
            
            # 詳細な統計情報をログ出力
            logger.debug(f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")
            logger.debug(f"Total features (n-grams): {self.tfidf_matrix.shape[1]}")
            logger.debug(f"Matrix density: {self.tfidf_matrix.nnz / (self.tfidf_matrix.shape[0] * self.tfidf_matrix.shape[1]):.4f}")
            
            # 各記事のベクトル密度
            for i, article_id in enumerate(self.article_ids):
                vector_density = self.tfidf_matrix[i].nnz / self.tfidf_matrix.shape[1]
                logger.debug(f"Article {article_id}: {self.tfidf_matrix[i].nnz} non-zero features, density: {vector_density:.4f}")
                
        except Exception as e:
            logger.error(f"Error building TF-IDF matrix: {e}")
            self.tfidf_matrix = None

    def calculate_similarity(self, article_id: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """指定された記事と類似度の高い記事を取得"""
        if self.tfidf_matrix is None or not self.article_ids:
            logger.warning("TF-IDF matrix not built")
            return []

        try:
            article_index = self.article_ids.index(article_id)
        except ValueError:
            logger.warning(f"Article {article_id} not found in TF-IDF matrix")
            return []

        # 指定された記事のベクトル
        article_vector = self.tfidf_matrix[article_index]
        
        # ベクトルの次元数と非ゼロ要素数をログ出力
        logger.debug(f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")
        logger.debug(f"Article vector shape: {article_vector.shape}")
        logger.debug(f"Non-zero features in article: {article_vector.nnz}")
        
        # 全記事との類似度を計算
        similarities = cosine_similarity(article_vector, self.tfidf_matrix).flatten()
        
        # 類似度の詳細統計情報をログ出力
        non_self_similarities = similarities[similarities < 0.9999]  # 自分自身を除く
        logger.debug(f"Similarity statistics:")
        logger.debug(f"  Min: {similarities.min():.6f}, Max: {similarities.max():.6f}")
        logger.debug(f"  Mean: {similarities.mean():.6f}, Std: {similarities.std():.6f}")
        if len(non_self_similarities) > 0:
            logger.debug(f"  Non-self mean: {non_self_similarities.mean():.6f}, std: {non_self_similarities.std():.6f}")
            logger.debug(f"  Unique similarity values: {len(np.unique(np.round(non_self_similarities, 3)))}")
        
        # 自分自身を除外して類似度の高い順にソート（安定ソート）
        # タイブレーカーとして記事IDを使用して決定的にする
        indexed_similarities = [(similarities[i], self.article_ids[i], i) for i in range(len(similarities))]
        indexed_similarities.sort(key=lambda x: (-x[0], x[1]))  # 類似度降順、ID昇順
        similar_indices = [x[2] for x in indexed_similarities]
        similar_articles = []
        
        # 利用可能な記事数を確認
        available_articles = len(self.article_ids) - 1  # 自分を除く
        actual_top_k = min(top_k, available_articles)
        
        logger.debug(f"Total articles: {len(self.article_ids)}, Available for comparison: {available_articles}, Requested: {top_k}")
        
        for idx in similar_indices:
            if idx != article_index:  # 自分自身を除外
                similarity_score = similarities[idx]
                similar_articles.append((self.article_ids[idx], similarity_score))
                if len(similar_articles) >= actual_top_k:
                    break
        
        logger.debug(f"Found {len(similar_articles)} similar articles for {article_id}")
        for i, (aid, sim) in enumerate(similar_articles):
            logger.debug(f"  {i+1}. {aid}: {sim:.6f}")
        
        return similar_articles

    def get_feature_names(self) -> List[str]:
        """特徴量名（単語）を取得"""
        if hasattr(self.vectorizer, 'get_feature_names_out'):
            return self.vectorizer.get_feature_names_out().tolist()
        else:
            return self.vectorizer.get_feature_names()

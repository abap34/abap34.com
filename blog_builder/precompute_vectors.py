#!/usr/bin/env python3
"""
TF-IDF ベクトルの事前計算スクリプト
"""
import json
import pathlib
import pickle
import logging
from typing import Dict, Any, Optional

try:
    import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    logger = logging.getLogger(__name__)
    logger.warning("tqdm not available, using basic progress indication")

from tfidf_similarity import TFIDFSimilarityCalculator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class VectorPrecomputeError(Exception):
    """ベクトル事前計算エラー"""
    pass


class VectorPrecomputer:
    """ベクトルの事前計算を管理するクラス"""
    
    VECTOR_CACHE_PATH = pathlib.Path("public/tfidf_cache.pkl")
    
    def __init__(self, tfidf_config: Optional[Dict[str, Any]] = None):
        self.tfidf_config = tfidf_config or {}
        try:
            self.calc = TFIDFSimilarityCalculator(self.tfidf_config)
        except Exception as e:
            raise VectorPrecomputeError(f"TF-IDF計算機の初期化に失敗: {e}")
        
    def precompute_all_vectors(self, posts_dir: pathlib.Path = pathlib.Path("posts")) -> None:
        """全記事のベクトルを事前計算してキャッシュに保存"""
        
        # 全MDファイルを取得
        md_files = list(posts_dir.glob("*.md"))
        logger.info(f"Found {len(md_files)} markdown files for vectorization")
        
        if not md_files:
            logger.warning("No markdown files found")
            return
            
        # 各記事のテキストを抽出
        article_contents = {}
        
        # プログレスバーの設定
        if HAS_TQDM:
            file_iter = tqdm.tqdm(md_files, desc="Loading articles", unit="file")
        else:
            file_iter = md_files
            
        for i, md_path in enumerate(file_iter):
            if not HAS_TQDM and i % 10 == 0:
                logger.info(f"Processing file {i+1}/{len(md_files)}")
                
            try:
                text = self.calc.extract_text_from_markdown(md_path)
                if len(text.strip()) > 50:  # 最小長チェック
                    # URLパスを生成（posts.jsonと一致させる）
                    article_url = f"https://abap34.com/posts/{md_path.stem}.html"
                    article_contents[article_url] = text
                    logger.debug(f"Loaded {md_path.name}: {len(text)} chars")
                else:
                    logger.warning(f"Skipping {md_path.name}: too short ({len(text)} chars)")
            except Exception as e:
                logger.error(f"Failed to load {md_path}: {e}")
        
        logger.info(f"Successfully loaded {len(article_contents)} articles for TF-IDF")
        
        if len(article_contents) < 2:
            raise VectorPrecomputeError("Need at least 2 articles for TF-IDF computation")
        
        # TF-IDF行列を構築
        logger.info("Building TF-IDF matrix...")
        try:
            self.calc.build_tfidf_matrix(article_contents)
            
            if self.calc.tfidf_matrix is None:
                raise VectorPrecomputeError("TF-IDF matrix construction failed")
                
        except Exception as e:
            raise VectorPrecomputeError(f"TF-IDF matrix construction error: {e}")
        
        # キャッシュデータを準備
        cache_data = {
            'tfidf_matrix': self.calc.tfidf_matrix,
            'article_ids': self.calc.article_ids,
            'vectorizer': self.calc.vectorizer,
            'tfidf_config': self.tfidf_config,
            'articles_count': len(article_contents)
        }
        
        # キャッシュファイルに保存
        logger.info(f"Saving TF-IDF cache to {self.VECTOR_CACHE_PATH}")
        try:
            # 保存先ディレクトリを作成
            self.VECTOR_CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
            
            with open(self.VECTOR_CACHE_PATH, 'wb') as f:
                pickle.dump(cache_data, f)
                
            logger.info(f"TF-IDF cache saved successfully")
            logger.info(f"  - Matrix shape: {self.calc.tfidf_matrix.shape}")
            logger.info(f"  - Vocabulary size: {len(self.calc.vectorizer.vocabulary_)}")
            logger.info(f"  - Articles: {len(article_contents)}")
            
        except Exception as e:
            raise VectorPrecomputeError(f"Failed to save TF-IDF cache: {e}")
    
    @classmethod
    def load_cached_vectors(cls) -> Dict[str, Any]:
        """キャッシュされたベクトルデータを読み込み"""
        try:
            if not cls.VECTOR_CACHE_PATH.exists():
                logger.warning(f"TF-IDF cache not found: {cls.VECTOR_CACHE_PATH}")
                return None
                
            with open(cls.VECTOR_CACHE_PATH, 'rb') as f:
                cache_data = pickle.load(f)
                
            logger.info(f"Loaded TF-IDF cache from {cls.VECTOR_CACHE_PATH}")
            logger.info(f"  - Matrix shape: {cache_data['tfidf_matrix'].shape}")
            logger.info(f"  - Articles: {cache_data['articles_count']}")
            
            return cache_data
            
        except Exception as e:
            logger.error(f"Failed to load TF-IDF cache: {e}")
            return None
    
    @classmethod
    def is_cache_valid(cls, current_config: Dict[str, Any]) -> bool:
        """キャッシュが現在の設定と一致するかチェック"""
        cache_data = cls.load_cached_vectors()
        if not cache_data:
            return False
            
        cached_config = cache_data.get('tfidf_config', {})
        
        # 設定の主要パラメータをチェック
        key_params = ['ngram_range', 'max_features', 'min_df', 'max_df', 'analyzer']
        
        for param in key_params:
            if cached_config.get(param) != current_config.get(param):
                logger.info(f"Cache invalid: {param} changed from {cached_config.get(param)} to {current_config.get(param)}")
                return False
                
        return True

def main() -> int:
    """メイン関数"""
    import sys
    
    # ログ設定
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s"
    )
    
    try:
        # 設定読み込み
        config_path = pathlib.Path("config/config.json")
        if not config_path.exists():
            logger.error("config.json not found")
            return 1
            
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
            
        tfidf_config = config.get('tfidf_config', {})
        
        # ベクトル計算実行
        precomputer = VectorPrecomputer(tfidf_config)
        precomputer.precompute_all_vectors()
        
        logger.info("Vector precomputation completed successfully")
        return 0
        
    except VectorPrecomputeError as e:
        logger.error(f"Vector precompute error: {e}")
        return 1
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
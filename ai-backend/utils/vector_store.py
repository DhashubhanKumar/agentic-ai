"""Simple in-memory vector store for product embeddings and semantic search"""

from typing import List, Dict, Any, Tuple
import json
import math


class SimpleVectorStore:
    """In-memory vector store with basic semantic search capabilities"""
    
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.embeddings: List[List[float]] = []
    
    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any] = None):
        """Add a document to the vector store"""
        # Simple embedding: word frequency vector (placeholder for actual embeddings)
        embedding = self._simple_embed(text)
        
        self.documents.append({
            "id": doc_id,
            "text": text,
            "metadata": metadata or {}
        })
        self.embeddings.append(embedding)
    
    def _simple_embed(self, text: str) -> List[float]:
        """
        Simple embedding using character-based hashing
        In production, use Groq embeddings or sentence-transformers
        """
        # Normalize text
        text = text.lower()
        
        # Create a simple 128-dimensional vector based on character frequencies
        vector = [0.0] * 128
        
        for char in text:
            if char.isalnum():
                idx = ord(char) % 128
                vector[idx] += 1.0
        
        # Normalize vector
        magnitude = math.sqrt(sum(x * x for x in vector))
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        
        return vector
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        return dot_product
    
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        if not self.documents:
            return []
        
        # Embed query
        query_embedding = self._simple_embed(query)
        
        # Calculate similarities
        similarities: List[Tuple[int, float]] = []
        for idx, doc_embedding in enumerate(self.embeddings):
            similarity = self._cosine_similarity(query_embedding, doc_embedding)
            similarities.append((idx, similarity))
        
        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Return top-k results
        results = []
        for idx, score in similarities[:top_k]:
            doc = self.documents[idx].copy()
            doc["similarity_score"] = score
            results.append(doc)
        
        return results
    
    def clear(self):
        """Clear all documents"""
        self.documents = []
        self.embeddings = []
    
    def load_from_products(self, products: List[Dict[str, Any]]):
        """Load products into vector store"""
        self.clear()
        
        for product in products:
            # Create searchable text from product data
            text = f"{product.get('name', '')} {product.get('brand', '')} {product.get('description', '')} {product.get('category', '')}"
            
            self.add_document(
                doc_id=product.get('id', ''),
                text=text,
                metadata=product
            )


# Global vector store instance
vector_store = SimpleVectorStore()

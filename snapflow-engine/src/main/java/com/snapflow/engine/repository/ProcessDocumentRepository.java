package com.snapflow.engine.repository;

import com.snapflow.engine.model.ProcessDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcessDocumentRepository extends MongoRepository<ProcessDocument, String> {
}

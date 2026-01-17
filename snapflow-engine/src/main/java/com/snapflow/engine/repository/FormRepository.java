package com.snapflow.engine.repository;

import com.snapflow.engine.model.FormDefinition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormRepository extends MongoRepository<FormDefinition, String> {
}

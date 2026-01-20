package com.snapflow.engine.repository;

import com.snapflow.engine.model.CollaborationMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollaborationMessageRepository extends MongoRepository<CollaborationMessage, String> {
    List<CollaborationMessage> findByContextTypeAndContextId(String contextType, String contextId);

    List<CollaborationMessage> findByContextTypeAndContextIdAndNodeId(String contextType, String contextId,
            String nodeId);
}

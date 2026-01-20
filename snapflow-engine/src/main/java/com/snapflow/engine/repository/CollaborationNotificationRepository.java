package com.snapflow.engine.repository;

import com.snapflow.engine.model.CollaborationNotification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollaborationNotificationRepository extends MongoRepository<CollaborationNotification, String> {
    List<CollaborationNotification> findByUserIdOrderByCreatedAtDesc(String userId);

    void deleteByUserId(String userId); // Optional cleanup
}

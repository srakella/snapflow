package com.snapflow.engine.repository;

import com.snapflow.engine.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    // Find comments for a specific workflow
    List<Comment> findByWorkflowId(String workflowId);

    // Find comments for a specific node within a workflow
    List<Comment> findByWorkflowIdAndNodeId(String workflowId, String nodeId);

    // Find replies to a specific comment
    List<Comment> findByParentId(String parentId);
}

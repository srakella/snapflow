package com.snapflow.engine.controller;

import com.snapflow.engine.model.Comment;
import com.snapflow.engine.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    private final CommentRepository commentRepository;

    @Autowired
    public CommentController(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    // Get all comments for a workflow
    @GetMapping("/workflow/{workflowId}")
    public List<Comment> getCommentsByWorkflow(@PathVariable String workflowId) {
        return commentRepository.findByWorkflowId(workflowId);
    }

    // Post a new comment
    @PostMapping
    public Comment createComment(@RequestBody Comment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    // Resolve a comment
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Comment> resolveComment(@PathVariable String id, @RequestBody Map<String, String> payload) {
        return commentRepository.findById(id).map(comment -> {
            comment.setResolved(true);
            comment.setResolvedBy(payload.get("userId"));
            comment.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(commentRepository.save(comment));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete a comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        commentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

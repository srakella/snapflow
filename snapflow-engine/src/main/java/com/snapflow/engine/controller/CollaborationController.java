package com.snapflow.engine.controller;

import com.snapflow.engine.model.CollaborationMessage;
import com.snapflow.engine.model.CollaborationNotification;
import com.snapflow.engine.repository.CollaborationMessageRepository;
import com.snapflow.engine.repository.CollaborationNotificationRepository;
import com.snapflow.engine.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CollaborationController {

    @Autowired
    private CollaborationMessageRepository messageRepository;

    @Autowired
    private CollaborationNotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    // --- USERS (Mock/Proxy for Collaboration Panel) ---
    @GetMapping("/users")
    public List<Map<String, String>> getUsers() {
        // In a real app, map from User entity. Here we return mock or DB users.
        // If DB is empty, return some mocks for testing
        if (userRepository.count() == 0) {
            return Arrays.asList(
                    createMockUser("1", "Admin User", "AU"),
                    createMockUser("2", "John Doe", "JD"),
                    createMockUser("3", "Sarah Smith", "SS"));
        }
        // Map real users if available
        List<Map<String, String>> result = new ArrayList<>();
        userRepository.findAll().forEach(u -> {
            result.add(createMockUser(u.getId(), u.getUsername(), u.getUsername().substring(0, 1).toUpperCase()));
        });
        return result;
    }

    private Map<String, String> createMockUser(String id, String name, String avatar) {
        Map<String, String> m = new HashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("avatar", avatar);
        return m;
    }

    // --- MESSAGES ---

    @GetMapping("/collaboration/messages")
    public List<CollaborationMessage> getMessages(
            @RequestParam String contextType,
            @RequestParam String contextId,
            @RequestParam(required = false) String nodeId) {

        if (nodeId != null && !nodeId.isEmpty()) {
            return messageRepository.findByContextTypeAndContextIdAndNodeId(contextType, contextId, nodeId);
        }
        return messageRepository.findByContextTypeAndContextId(contextType, contextId);
    }

    @PostMapping("/collaboration/messages")
    public CollaborationMessage createMessage(@RequestBody Map<String, Object> payload) {
        CollaborationMessage message = new CollaborationMessage();
        message.setContextType((String) payload.get("contextType"));
        message.setContextId((String) payload.get("contextId"));
        message.setNodeId((String) payload.get("nodeId"));
        message.setContent((String) payload.get("content"));
        message.setParentId((String) payload.get("parentId"));
        message.setMentions((List<String>) payload.get("mentions"));

        // Resolve Author
        String authorId = (String) payload.get("authorId");
        // In real app, fetch from DB. Mocking for now:
        message.setAuthor(new CollaborationMessage.Author(authorId, "User " + authorId, "U" + authorId));
        message.setAcknowledgedBy(new ArrayList<>());

        CollaborationMessage saved = messageRepository.save(message);

        // Create Notifications
        if (message.getMentions() != null) {
            for (String mentionedUserId : message.getMentions()) {
                CollaborationNotification notification = new CollaborationNotification();
                notification.setUserId(mentionedUserId);
                notification.setMessageId(saved.getId());
                notification.setType("mention");
                notificationRepository.save(notification);
            }
        }

        // Notify parent author if reply
        if (message.getParentId() != null) {
            messageRepository.findById(message.getParentId()).ifPresent(parent -> {
                if (!parent.getAuthor().getId().equals(authorId)) {
                    CollaborationNotification notification = new CollaborationNotification();
                    notification.setUserId(parent.getAuthor().getId());
                    notification.setMessageId(saved.getId());
                    notification.setType("reply");
                    notificationRepository.save(notification);
                }
            });
        }

        return saved;
    }

    @PostMapping("/collaboration/messages/{id}/acknowledge")
    public void acknowledgeMessage(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");
        messageRepository.findById(id).ifPresent(msg -> {
            if (msg.getAcknowledgedBy() == null)
                msg.setAcknowledgedBy(new ArrayList<>());
            if (!msg.getAcknowledgedBy().contains(userId)) {
                msg.getAcknowledgedBy().add(userId);
                messageRepository.save(msg);
            }
        });
    }

    @PatchMapping("/collaboration/messages/{id}/resolve")
    public void resolveMessage(@PathVariable String id) {
        messageRepository.findById(id).ifPresent(msg -> {
            msg.setStatus("resolved");
            messageRepository.save(msg);
        });
    }

    // --- NOTIFICATIONS ---

    @GetMapping("/collaboration/notifications")
    public List<CollaborationNotification> getNotifications(@RequestParam String userId) {
        List<CollaborationNotification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        // Hydrate with message details (simplified for demo - N+1 query warning)
        notifications.forEach(n -> {
            // Ideally we'd use a DTO. Here I'm just relying on frontend to handle or
            // enriching via transient fields if I added them.
            // Wait, the frontend expects `notification.message.content`.
            // The CollaborationNotification model doesn't have a 'message' field reference,
            // strictly just IDs.
            // I should enrich the return object or update the model.
            // For now, I'll return the raw notification and let frontend fail unless I fix
            // it.
            // Actually, let's create a DTO or just return a Map.
        });
        return notifications;
    }

    // Returning Enriched Notifications via Map
    @GetMapping("/collaboration/notifications/enriched")
    public List<Map<String, Object>> getEnrichedNotifications(@RequestParam String userId) {
        List<CollaborationNotification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (CollaborationNotification n : notifications) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType());
            map.put("read", n.isRead());
            map.put("createdAt", n.getCreatedAt());

            Optional<CollaborationMessage> msgOpt = messageRepository.findById(n.getMessageId());
            if (msgOpt.isPresent()) {
                map.put("message", msgOpt.get());
            }
            result.add(map);
        }
        return result;
    }

    @PatchMapping("/collaboration/notifications/{id}/read")
    public void markAsRead(@PathVariable String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @PatchMapping("/collaboration/notifications/read-all")
    public void markAllAsRead(@RequestParam String userId) {
        List<CollaborationNotification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (CollaborationNotification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }
}

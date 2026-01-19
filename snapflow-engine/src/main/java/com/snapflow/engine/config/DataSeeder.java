package com.snapflow.engine.config;

import com.snapflow.engine.model.User;
import com.snapflow.engine.model.UserGroup;
import com.snapflow.engine.repository.UserGroupRepository;
import com.snapflow.engine.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, UserGroupRepository groupRepository) {
        return args -> {
            // 1. Create Groups if not exist
            UserGroup adminGroup = groupRepository.findByCode("ADMIN")
                    .orElseGet(() -> groupRepository.save(new UserGroup("ADMIN", "Administrators")));

            UserGroup designerGroup = groupRepository.findByCode("DESIGNER")
                    .orElseGet(() -> groupRepository.save(new UserGroup("DESIGNER", "Workflow Designers")));

            UserGroup userGroup = groupRepository.findByCode("USER")
                    .orElseGet(() -> groupRepository.save(new UserGroup("USER", "Standard Users")));

            // 2. Create Users
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User("admin", "Admin User", "admin@snapflow.com", "");
                admin.setGroups(Set.of(adminGroup, designerGroup, userGroup));
                userRepository.save(admin);
            }

            if (userRepository.findByUsername("sarah").isEmpty()) {
                User sarah = new User("sarah", "Sarah Designer", "sarah@snapflow.com", "");
                sarah.setGroups(Set.of(designerGroup, userGroup)); // Designer can also be a user
                userRepository.save(sarah);
            }

            if (userRepository.findByUsername("bob").isEmpty()) {
                User bob = new User("bob", "Bob Approver", "bob@snapflow.com", "");
                bob.setGroups(Set.of(userGroup));
                userRepository.save(bob);
            }

            System.out.println("Identity data seeded successfully.");
        };
    }
}

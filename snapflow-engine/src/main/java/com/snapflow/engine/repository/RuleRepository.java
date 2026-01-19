package com.snapflow.engine.repository;

import com.snapflow.engine.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RuleRepository extends JpaRepository<Rule, UUID> {

    List<Rule> findByRuleSetId(UUID ruleSetId);

    @Query("SELECT r FROM Rule r WHERE r.ruleSetId = :ruleSetId AND r.enabled = :enabled ORDER BY r.priority DESC")
    List<Rule> findByRuleSetIdAndEnabledOrderByPriorityDesc(
            @Param("ruleSetId") UUID ruleSetId,
            @Param("enabled") Boolean enabled);

    List<Rule> findByRuleSetIdOrderByPriorityDesc(UUID ruleSetId);
}

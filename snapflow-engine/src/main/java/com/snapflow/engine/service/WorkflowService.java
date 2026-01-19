package com.snapflow.engine.service;

import com.snapflow.engine.model.ProcessDocument;
import com.snapflow.engine.repository.ProcessDocumentRepository;
import org.flowable.engine.RepositoryService;
import org.flowable.engine.repository.Deployment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class WorkflowService {

    private final ProcessDocumentRepository processDocumentRepository;
    private final RepositoryService repositoryService;

    @Autowired
    public WorkflowService(ProcessDocumentRepository processDocumentRepository, RepositoryService repositoryService) {
        this.processDocumentRepository = processDocumentRepository;
        this.repositoryService = repositoryService;
    }

    @Transactional
    public ProcessDocument saveWorkflow(String name, Map<String, Object> jsonState, String xml) {
        // 1. Save UI State to MongoDB
        ProcessDocument document = new ProcessDocument(name, jsonState);
        // Check if exists to update? For now, we always create new or simplistic
        // overwrite logic could correspond to ID if provided
        // But for this requirement, we'll just save a new document per "save" or treat
        // name as unique?
        // Let's assume we save a new snapshot for now, or let the UI pass an ID to
        // update.
        // Determining if update: "name" could be the key, or we let Mongo handle IDs.
        // User asked for "Saves the JSON... (for the UI to reload later)".

        // Let's try to find by name first to update, otherwise create new
        // Ideally we should generate ID in frontend, but "name" is unique enough for
        // this demo.
        // Actually, let's just save.

        processDocumentRepository.save(document);

        // 2. Deploy to Flowable (Postgres)
        Deployment deployment = repositoryService.createDeployment()
                .addString(name + ".bpmn20.xml", xml)
                .name(name)
                .deploy();

        // We might want to link valid deployment ID to the mongo doc, but not strictly
        // asked.

        return document;
    }

    public List<ProcessDocument> getAllWorkflows() {
        return processDocumentRepository.findAll();
    }

    public Optional<ProcessDocument> getWorkflow(String id) {
        return processDocumentRepository.findById(id);
    }

    /**
     * Delete a workflow by ID
     */
    @Transactional
    public void deleteWorkflow(String id) {
        processDocumentRepository.deleteById(id);
    }
}

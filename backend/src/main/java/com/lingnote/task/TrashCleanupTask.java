package com.lingnote.task;

import com.lingnote.service.NoteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled task that cleans up trashed notes older than 15 days.
 * Runs daily at 2:00 AM.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TrashCleanupTask {

    private static final int TRASH_RETENTION_DAYS = 15;

    private final NoteService noteService;

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("Trash cleanup task registered: runs daily at 2:00 AM, retains notes for {} days", TRASH_RETENTION_DAYS);
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void cleanup() {
        log.info("Starting trash cleanup for notes older than {} days", TRASH_RETENTION_DAYS);
        noteService.cleanupOldTrash(TRASH_RETENTION_DAYS);
        log.info("Trash cleanup completed");
    }
}

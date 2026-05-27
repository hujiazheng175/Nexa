package com.lingnote.controller;

import com.lingnote.common.response.Result;
import com.lingnote.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    private static final long MAX_SIZE = 10 * 1024 * 1024;

    private final Path uploadDir;

    public FileController(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping("/upload")
    public Result<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new BusinessException(400, "File is empty");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException(400, "File size exceeds 10MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException(400, "Unsupported file type: " + contentType);
        }

        String dateDir = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        Path targetDir = uploadDir.resolve(dateDir);
        Files.createDirectories(targetDir);

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID().toString().substring(0, 8) + "_" + System.currentTimeMillis() + ext;
        Path targetPath = targetDir.resolve(filename);
        file.transferTo(targetPath.toFile());

        String url = "/uploads/" + dateDir + "/" + filename;
        return Result.success(Map.of("url", url));
    }
}

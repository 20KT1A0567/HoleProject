package com.vrtechnologies.ecommerce.controller;

import com.vrtechnologies.ecommerce.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/upload")
@RequiredArgsConstructor
@Slf4j
public class MediaUploadController {

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/svg+xml"
    );

    private static final List<String> ALLOWED_VIDEO_TYPES = List.of(
            "video/mp4", "video/webm", "video/quicktime", "video/x-matroska"
    );

    private final S3Service s3Service;

    @Value("${app.upload.max-image-bytes}")
    private long maxImageBytes;

    @Value("${app.upload.max-video-bytes}")
    private long maxVideoBytes;

    @PostMapping("/image")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "images") String folder
    ) {
        try {
            validate(file, ALLOWED_IMAGE_TYPES, maxImageBytes, "image");
            String url = s3Service.uploadFile(file, sanitize(folder));
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Image upload failed", ex);
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + ex.getMessage()));
        }
    }

    @PostMapping("/video")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "videos") String folder
    ) {
        try {
            validate(file, ALLOWED_VIDEO_TYPES, maxVideoBytes, "video");
            String url = s3Service.uploadFile(file, sanitize(folder));
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Video upload failed", ex);
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + ex.getMessage()));
        }
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'STORE_MANAGER')")
    public ResponseEntity<?> deleteByUrl(@RequestParam("url") String url) {
        s3Service.deleteByUrl(url);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    private void validate(MultipartFile file, List<String> allowed, long maxBytes, String label) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > maxBytes) {
            throw new IllegalArgumentException(label + " exceeds max size of " + (maxBytes / (1024 * 1024)) + " MB");
        }
        String type = file.getContentType();
        if (type == null || !allowed.contains(type.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported " + label + " type: " + type);
        }
    }

    private String sanitize(String folder) {
        if (folder == null) return "uploads";
        String cleaned = folder.replaceAll("[^a-zA-Z0-9/_-]", "");
        return cleaned.isBlank() ? "uploads" : cleaned;
    }
}

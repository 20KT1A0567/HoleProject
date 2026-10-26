package com.vrtechnologies.ecommerce.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final AmazonS3 amazonS3;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }

        String key = generateKey(file, folder);

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        if (file.getContentType() != null) {
            metadata.setContentType(file.getContentType());
        }

        PutObjectRequest request = new PutObjectRequest(bucketName, key, file.getInputStream(), metadata);
        amazonS3.putObject(request);

        return amazonS3.getUrl(bucketName, key).toString();
    }

    public void deleteByUrl(String fileUrl) {
        String key = extractKey(fileUrl);
        if (key == null || key.isBlank()) return;
        try {
            amazonS3.deleteObject(bucketName, key);
        } catch (RuntimeException ex) {
            log.warn("Failed to delete S3 object key={}: {}", key, ex.getMessage());
        }
    }

    private String generateKey(MultipartFile file, String folder) {
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf("."))
                : "";

        String prefix = (folder == null || folder.isBlank()) ? "" : folder.replaceAll("^/+|/+$", "") + "/";
        return prefix + UUID.randomUUID() + ext;
    }

    private String extractKey(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return null;
        try {
            URI uri = URI.create(fileUrl.trim());
            String path = uri.getPath();
            if (path == null || path.isBlank()) return null;
            String key = path.startsWith("/") ? path.substring(1) : path;
            if (key.startsWith(bucketName + "/")) key = key.substring(bucketName.length() + 1);
            return URLDecoder.decode(key, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            return URLDecoder.decode(fileUrl, StandardCharsets.UTF_8);
        }
    }
}

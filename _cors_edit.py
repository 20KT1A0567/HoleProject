from pathlib import Path 
p=Path('Backend_Original/src/main/java/com/project/Anusha/config/SecurityConfig.java') 
s=p.read_text(encoding='utf-8') 
s=s.replace('import org.springframework.context.annotation.Bean;\n','import org.springframework.beans.factory.annotation.Value;\nimport org.springframework.context.annotation.Bean;\n') 
s=s.replace('import java.util.Arrays;\n','import java.util.ArrayList;\nimport java.util.Arrays;\nimport java.util.List;\n') 
s=s.replace('public class SecurityConfig {\n','public class SecurityConfig {\n\n    @Value(\"${app.cors.allowed-origins:}\")\n    private String extraAllowedOrigins;\n',1)

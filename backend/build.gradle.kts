import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.5.0"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("jvm") version "2.1.0"
    kotlin("plugin.spring") version "2.1.0"
    kotlin("plugin.jpa") version "2.1.0"
}

group = "com.finance"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
    // FIX 1: Required for Spring AI milestone versions (like 1.0.0-M1)
    maven { url = uri("https://spring.io") }
    maven { url = uri("https://repo.spring.io/milestone") }
}

// FIX 2: Define BOM versions for Spring Cloud
val springCloudVersion = "2025.0.3"

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion")
    }
}

dependencies {
    // --- Spring Boot Core ---
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    // --- Spring Security ---
    implementation("org.springframework.boot:spring-boot-starter-security")

    // --- Spring Session + Redis ---
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    implementation("org.springframework.session:spring-session-data-redis")

    // --- Spring Data JPA + MySQL ---
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("com.mysql:mysql-connector-j")
    implementation("io.hypersistence:hypersistence-utils-hibernate-63:3.15.3")

    // --- WebClient (for Frankfurter API) ---
    implementation("org.springframework.boot:spring-boot-starter-webflux")

    // --- Kotlin ---
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    // DB migrations
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")

    // HTTP client
    // FIX 3: Version managed by Spring Cloud BOM
    implementation("org.springframework.cloud:spring-cloud-starter-openfeign")
    // FIX 4: Explicit version added as it is not always managed by the core BOM
    implementation("io.github.openfeign:feign-okhttp:13.5")

    // Ollama (AI) integration
    implementation("org.springframework.ai:spring-ai-ollama-spring-boot-starter:1.0.0-M1")

    // PDF parsing
    implementation("org.apache.pdfbox:pdfbox:2.0.30")

    // --- Testing ---
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
}

tasks.withType<KotlinCompile> {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_21)
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

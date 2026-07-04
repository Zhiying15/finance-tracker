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
}

val springCloudVersion = "2025.0.3"

dependencyManagement {
    imports {
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:$springCloudVersion")
        mavenBom("org.springframework.ai:spring-ai-bom:1.0.0")
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

    // --- DB Migrations ---
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-mysql")

    // --- HTTP Client (Frankfurter + any external API calls) ---
    // Feign replaces WebClient — no webflux needed
    implementation("org.springframework.cloud:spring-cloud-starter-openfeign")
    implementation("io.github.openfeign:feign-okhttp:13.5")

    // ✅ Remove spring-boot-starter-webflux entirely — conflicts with openfeign
    // via ReactiveObservationConfiguration bean name clash in Spring Boot 3.5.0

    // ✅ Remove r2dbc-spi — no longer needed once webflux is removed

    // --- Spring AI Ollama ---
    // spring-ai-starter-model-ollama already includes spring-ai-ollama transitively
    // Remove the duplicate spring-ai-ollama direct dependency
    implementation("org.springframework.ai:spring-ai-starter-model-ollama")

    // --- PDF Parsing ---
    implementation("org.apache.pdfbox:pdfbox:2.0.30")

    // --- Kotlin ---
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

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

package com.finance.utility

import java.security.SecureRandom
import java.security.spec.KeySpec
import java.util.Base64
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

object PBKDF2Hasher {
    private const val ALGORITHM = "PBKDF2WithHmacSHA256"
    private const val ITERATIONS = 65536
    private const val KEY_LENGTH = 256
    private const val SALT_LENGTH = 16

    fun hashPassword(password: String): String {
        val random = SecureRandom()
        val salt = ByteArray(SALT_LENGTH)
        random.nextBytes(salt)

        val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH)
        val factory = SecretKeyFactory.getInstance(ALGORITHM)
        val hash = factory.generateSecret(spec).encoded

        // Combine salt and hash into a single string for storage
        return Base64.getEncoder().encodeToString(salt) + ":" + Base64.getEncoder().encodeToString(hash)
    }

    fun verifyPassword(password: String, storedHashString: String): Boolean {
        val parts = storedHashString.split(":")
        val salt = Base64.getDecoder().decode(parts[0])
        val storedHash = Base64.getDecoder().decode(parts[1])

        val spec: KeySpec = PBEKeySpec(password.toCharArray(), salt, ITERATIONS, KEY_LENGTH)
        val factory = SecretKeyFactory.getInstance(ALGORITHM)
        val testHash = factory.generateSecret(spec).encoded

        return storedHash.contentEquals(testHash)
    }
}

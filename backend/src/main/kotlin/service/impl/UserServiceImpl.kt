package com.finance.service.impl

import com.finance.constants.ResponseCode
import com.finance.constants.TransactionStatus
import com.finance.dto.request.SignInRequest
import com.finance.dto.request.UserRequest
import com.finance.dto.response.BaseResponse
import com.finance.entity.User
import com.finance.repository.UserRepository
import com.finance.service.UserService
import com.finance.utility.PBKDF2Hasher
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class UserServiceImpl: UserService {

    companion object {
        // Replaces Lombok's @Slf4j log instance
        private val log = LoggerFactory.getLogger(UserServiceImpl::class.java)
    }

    @Autowired
    private lateinit var userRepository: UserRepository

    override fun signIn(signInRequest: SignInRequest): BaseResponse {

        val foundUser = userRepository.findByEmail(signInRequest.email)
        if (foundUser != null) {
            // Added closing parenthesis and separated the opening brace
            if (PBKDF2Hasher.verifyPassword(signInRequest.password, foundUser.passwordHash)) {
                log.info("User signed in")
                return BaseResponse(
                    ResponseCode.SUCCESS,
                    foundUser.id.toString()
                )
            } else {
                log.info("User not signed in")
                return BaseResponse(
                    ResponseCode.UNAUTHENTICATED,
                    "Sign in failed"
                )
            }
        }
        return BaseResponse(
            ResponseCode.UNAUTHENTICATED,
            "Sign in failed"
        )
    }

    override fun signUp(userRequest: UserRequest): BaseResponse {
        val existingUser = userRepository.findByEmail(userRequest.email)
        if (existingUser == null) {
            val createdUser = userRepository.save(mapRequestToUser(userRequest))
            return BaseResponse(
                ResponseCode.SUCCESS,
                createdUser.id.toString()
            )
        } else {
            return BaseResponse(
                ResponseCode.FAILURE,
                "User exists"
            )
        }

    }

    override fun signOut(): BaseResponse {
        return BaseResponse(
            ResponseCode.SUCCESS,
            "Signed out"
        )
    }

    override fun listUser(): List<User> {
        return userRepository.findAll()
    }

    override fun updateUser(userIdentifier: String, userRequest: UserRequest): BaseResponse {
        val currentUser = userRepository.findById(userIdentifier).orElse(null)

        if (currentUser != null) {
            // ❌ Code to execute if the value EXISTS goes here
            if (!currentUser.email.equals(userRequest.email)) {
                log.info("Updating user({})'s email", userIdentifier)
                currentUser.email = userRequest.email

            }
            if (!currentUser.fullName.equals(userRequest.fullName)) {
                log.info("Updating user({})'s fullname", userIdentifier)
                currentUser.fullName = userRequest.fullName
            }
            if (!currentUser.passwordHash.equals(userRequest.password)) {
                log.info("Updating user({})'s emapasswordil", userIdentifier)
                currentUser.passwordHash = PBKDF2Hasher.hashPassword(userRequest.password)
            }
            userRepository.save(currentUser)
            return BaseResponse(ResponseCode.SUCCESS, currentUser.id.toString())

        } else {
            // ❓ Code to execute if the value IS MISSING goes here
            return BaseResponse(ResponseCode.FAILURE, "User not found")
        }
    }

    private fun mapRequestToUser(userRequest: UserRequest): User {
        return User(
            email = userRequest.email,
            fullName = userRequest.fullName,
            passwordHash = PBKDF2Hasher.hashPassword(userRequest.password))
    }

}
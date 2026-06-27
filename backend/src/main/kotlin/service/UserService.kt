package com.finance.service

import com.finance.dto.request.SignInRequest
import com.finance.dto.request.UserRequest
import com.finance.dto.response.BaseResponse
import com.finance.entity.User
import org.springframework.stereotype.Service

@Service
interface UserService {
    fun signIn(signInRequest: SignInRequest): BaseResponse
    fun signUp(userRequest: UserRequest): BaseResponse
    fun signOut(): BaseResponse
    fun listUser(): List<User>
    fun updateUser(userIdentifier: String, userRequest: UserRequest): BaseResponse

}
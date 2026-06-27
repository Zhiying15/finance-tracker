package com.finance.controller

import com.finance.constants.APIConstant
import com.finance.dto.request.SignInRequest
import com.finance.dto.request.UserRequest
import com.finance.dto.response.BaseResponse
import com.finance.entity.User
import com.finance.service.UserService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.net.http.HttpHeaders

// 2. Class-level annotations for routing
@RestController
@RequestMapping("/finance-tracker/users")
class UserController {

    @Autowired
    private lateinit var userService: UserService

    @GetMapping(APIConstant.LIST_USERS)
    @ResponseStatus(HttpStatus.OK)
    fun listUsers(): List<User> {
        return userService.listUser()
    }

    @PostMapping(APIConstant.SIGNUP)
    @ResponseStatus(HttpStatus.CREATED)
    fun signUp(@RequestBody userRequest: UserRequest): BaseResponse {
        return userService.signUp(userRequest);
    }

    @PostMapping(APIConstant.SIGNIN)
    @ResponseStatus(HttpStatus.OK)
    fun signUp(@RequestBody signInRequest: SignInRequest): BaseResponse {
        return userService.signIn(signInRequest);
    }

    @PatchMapping(APIConstant.UPDATE_USER_DETAILS)
    @ResponseStatus(HttpStatus.OK)
    fun updateUserDetails(
        @RequestHeader(name = "userIdentifier", required = true) userIdentifier: String,
        @RequestBody userRequest: UserRequest): BaseResponse {
        return userService.updateUser(userIdentifier, userRequest);
    }

    @PostMapping(APIConstant.SIGNOUT)
    @ResponseStatus(HttpStatus.OK)
    fun signOut() : BaseResponse {
        return userService.signOut()
    }
}

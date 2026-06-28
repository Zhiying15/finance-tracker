package com.finance.utility


import com.finance.constants.SessionConstant
import com.finance.exception.AppException
import com.finance.security.UserPrincipal
import jakarta.servlet.http.HttpSession

object SecurityUtils {
    fun resolveCurrentUser(session: HttpSession?): UserPrincipal =
        session?.getAttribute(SessionConstant.USER_PRINCIPAL_KEY) as? UserPrincipal
            ?: throw AppException.Unauthorized("No active session")
}
package com.finance.common.utility

import com.finance.common.constants.SessionConstant
import com.finance.common.exception.AppException
import jakarta.servlet.http.HttpSession
import com.finance.user.security.UserPrincipal

object SecurityUtils {
    fun resolveCurrentUser(session: HttpSession?): UserPrincipal =
        session?.getAttribute(SessionConstant.USER_PRINCIPAL_KEY) as? UserPrincipal
            ?: throw AppException.Unauthorized("No active session")
}
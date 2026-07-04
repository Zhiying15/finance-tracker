package com.financecommon.utility

import common.constants.SessionConstant
import common.exception.AppException
import jakarta.servlet.http.HttpSession
import com.finance.user.security.UserPrincipal

object SecurityUtils {
    fun resolveCurrentUser(session: HttpSession?): UserPrincipal =
        session?.getAttribute(SessionConstant.USER_PRINCIPAL_KEY) as? UserPrincipal
            ?: throw AppException.Unauthorized("No active session")
}
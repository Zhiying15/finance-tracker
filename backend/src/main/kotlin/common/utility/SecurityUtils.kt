package common.utility

import common.constants.SessionConstant
import common.exception.AppException
import jakarta.servlet.http.HttpSession
import user.security.UserPrincipal

object SecurityUtils {
    fun resolveCurrentUser(session: HttpSession?): UserPrincipal =
        session?.getAttribute(SessionConstant.USER_PRINCIPAL_KEY) as? UserPrincipal
            ?: throw AppException.Unauthorized("No active session")
}
package com.finance.dto.response

import com.finance.constants.ResponseCode

data class BaseResponse(
    val responseCode: ResponseCode,
    val message: String
)

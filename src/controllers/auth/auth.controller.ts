import { createUser, getUser, saveRefreshToken, verifyRefreshToken, revokeRefreshToken } from "@/services/auth.service";
import { catchAsync } from "@/utils/catchAsync";
import { loginSchemaType, registerSchemaType, refreshTokenSchemaType } from "@/validator/auth.validator";
import { isEmpty } from "lodash";
import { bcryptVerify } from "@/utils/hashing";
import ApiError from "@/utils/ApiError";
import { generateToken, generateRefreshToken, verifyToken } from "@/utils/jwt";
import * as HttpStatus from "http-status";

// Register
export const register = catchAsync(async (c) => {
  const { email, firstName, lastName, password, phone, username }: registerSchemaType = await c.req.parseBody();

  const result = await createUser({
    email,
    firstName,
    lastName,
    password,
    phone,
    username,
  });

  return c.json({ data: result });
});

// Login (generate access & refresh token)
export const login = catchAsync(async (c) => {
  const { password, username }: loginSchemaType = await c.req.parseBody();

  // Bisa login pakai email atau phone (sesuaikan fungsi getUser)
  const findUser = await getUser({ email: username, phone: username });

  if (isEmpty(findUser)) {
    throw new ApiError(HttpStatus.default.UNAUTHORIZED, { message: "Unauthorized" });
  }

  const verifiedPassword = await bcryptVerify(password, findUser.password);
  if (!verifiedPassword) {
    throw new ApiError(HttpStatus.default.UNAUTHORIZED, { message: "Unauthorized" });
  }

  // Buat payload token
  const payload = {
    id: findUser.id,
    email: findUser.email,
    roles: findUser.roles?.[0] || ""
  };

  const accessToken = await generateToken(payload);
  const { token, tmpExp } = await generateRefreshToken(payload);

  // Simpan refresh token di DB/cache untuk nanti bisa validasi & revoke
  await saveRefreshToken(findUser.id, token, new Date(tmpExp));

  return c.json({
    data: {
      firstName: findUser.firstName,
      lastName: findUser.lastName,
      email: findUser.email,
      roles: payload.roles,
      authorization: {
        token: accessToken,
        refreshToken,
      },
    },
  });
});

// Refresh Access Token
export const refreshToken = catchAsync(async (c) => {
  const { refreshToken }: refreshTokenSchemaType = await c.req.parseBody();

  if (!refreshToken) {
    throw new ApiError(HttpStatus.default.BAD_REQUEST, { message: "Refresh token required" });
  }

  // Verifikasi refresh token
  const decoded = await verifyToken(refreshToken);
  if (!decoded) {
    throw new ApiError(HttpStatus.default.UNAUTHORIZED, { message: "Invalid refresh token" });
  }

  // Cek apakah refresh token valid di DB/cache (belum di revoke)
  const isValid = await verifyRefreshToken(refreshToken);
  if (!isValid) {
    throw new ApiError(HttpStatus.default.UNAUTHORIZED, { message: "Refresh token revoked" });
  }

  // Generate access token baru
  const newAccessToken = await generateToken({
    id: decoded.id as string,
    email: decoded.email as string,
    roles: decoded.roles as string,
  });

  return c.json({
    data: {
      token: newAccessToken,
    },
  });
});

// Logout (revoke refresh token)
export const logout = catchAsync(async (c) => {
  const { refreshToken }: refreshTokenSchemaType = await c.req.parseBody();

  if (!refreshToken) {
    throw new ApiError(HttpStatus.default.BAD_REQUEST, { message: "Refresh token required" });
  }

  const decoded = await verifyToken(refreshToken);
  if (!decoded) {
    throw new ApiError(HttpStatus.default.UNAUTHORIZED, { message: "Invalid refresh token" });
  }

  await revokeRefreshToken(refreshToken);

  return c.json({ message: "Logout successful" });
});

// 1. Token del navegador (NUEVO)
const SIGNUP_TOKEN = 'EAATX8Cf5T6JiUbldivkE3aZHAqv60ZxrXLY_TSFFeYueLyoCbc8j9_qYuybMYZwBRmG-iU3j9ZLReprTptk6-BQs5nsOkYGcWdu-C9ju7WiwS60L5ML-ubI'; 

// 2. Token de acceso (El ya29...)
const ACCESS_TOKEN = 'ya29.c.c0AYnqXlgTQWwFf5Lk6wuv2bsDY2zPGKdA9sSpaOuMQ7jHuHzrplfTBiLXZiB04S55Opx5ss7IpRnxPT2h8vTvYjm0P4bsP-BT20WRRZbhc2gbusLSjFvZ8Tex0mWqNIOmMwCSSE83mMBAOyXL1yCRtYCrwePVhAy8sptb7a0Xm5peXuqSpqF3N-zvxEBVRO-S1kCXWjKeC-3ImZyU94RvaDj3Dz6syfhp_Ui-9BJGw5MaWYXl1UwImxyfoUV3ZAYFWA3kqCFvPDkgpHILGTIeNPTkO5C7YX8jvJNwCT2-yd__TpSnC-dV1BRIx_tp2L2S4S_8dauMIW91f_G9kUbxvXFHjBmqgZiKA5GmErfZSPkcNVU_faXp61jTN385A-Qcsnlatpdd9QsQSzm72s1egO0UBvYnRVaatnyn13-US5b80Xq9OY0RZiWvSpQrof4qF0qwhZ8eox1tOj59tOmuIW63lVwFIzsmm7j4fapsSk0Iweo7Z2d4nuOJ4c9cjJg4lUISByZBmawzjIdyId7I69X218SeawiZYJd0-RJrrXfkY_uWX3v4St2RgvjZSxFtpwBMkqFV3un7ebj_3575t3Rw2o7eRO6dIVav2U96dr_21fxW0mb4Q8n6ouUfR6anwZqnvz1zSQfa4aiUt29SeMZq3eOMtwQvWxi0eYXrk_bYxe7cdObajXv4f70fbxiaMf1gfW_m_1d8ISX8Ra0RlUokjqYVf5S66mZq7YUQlwu5qe_QtuntOVY0XVF8yvn_Zk4Vuu0V0I8hhRvdzn0gk7a2vcd9M9ivhh5cdReSbyb-9yUF5qyhf5JI-itU2023-su_1tyyx84QvnZrf3dovmabv51wvgvIumYB8uX04-F5X3O1d1Z_bvWoy5y26MQ-ZqvvUVvoO5jR61_6szmWkdJlz_U5lWaz2fda6aVysBl1Wjnx8rkzBuOh7fwXiyyiZUfXFoIVjXUlU6Z_0c0iqI0k2erbIthg7d4Q4kIk7x3Mz-h7w5ns8Uh';

const PROJECT_ID = 'versatile-bolt-405014';

console.log("\nCOPIA Y PEGA ESTA LÍNEA ENTERA EN TU TERMINAL:\n");
console.log(`curl -X POST "https://androidmanagement.googleapis.com/v1/enterprises?projectId=${PROJECT_ID}&signupToken=${SIGNUP_TOKEN}" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "Content-Type: application/json" -d "{\\"enterpriseDisplayName\\":\\"Produccion\\"}"`);
console.log("\n");
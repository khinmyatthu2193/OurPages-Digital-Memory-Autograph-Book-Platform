export function notFoundHandler(request, response) {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method} ${request.originalUrl} was not found`,
    },
  });
}

export function errorHandler(error, _request, response, _next) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const expose = status < 500;

  if (!expose) {
    console.error(error);
  }

  response.status(status).json({
    error: {
      code: error.code ?? 'INTERNAL_SERVER_ERROR',
      message: expose ? error.message : 'An unexpected error occurred',
      ...(expose && error.details ? { details: error.details } : {}),
    },
  });
}

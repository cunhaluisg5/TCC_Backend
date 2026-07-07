const swaggerJsdoc = require('swagger-jsdoc');
const { publicBaseUrl } = require('../config/app');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Scan NFC-e API',
    version: '1.0.0',
    description: 'Documentacao oficial da API do ecossistema Scan NFC-e.'
  },
  servers: [
    {
      url: publicBaseUrl,
      description: 'Servidor principal'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      AuthRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'usuario@email.com' },
          password: { type: 'string', minLength: 6, example: '123456' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Luis Gustavo' },
          email: { type: 'string', format: 'email', example: 'usuario@email.com' },
          password: { type: 'string', minLength: 6, example: '123456' }
        }
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'usuario@email.com' }
        }
      },
      ResetPasswordValidateRequest: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string', example: 'ab12cd34ef56gh78ij90' }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'usuario@email.com' },
          token: { type: 'string', example: 'ab12cd34ef56gh78ij90' },
          password: { type: 'string', minLength: 6, example: 'novaSenha123' }
        }
      },
      ResetPasswordValidationResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'ab12cd34ef56gh78ij90' },
          email: { type: 'string', format: 'email', example: 'usuario@email.com' },
          name: { type: 'string', example: 'Luis Gustavo' },
          expiresAt: { type: 'string', format: 'date-time' }
        }
      },
      UpdateProfileRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Luis Atualizado' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'firebase-user-id' },
          _id: { type: 'string', example: 'firebase-user-id' },
          name: { type: 'string', example: 'Luis Gustavo' },
          email: { type: 'string', format: 'email', example: 'usuario@email.com' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { '$ref': '#/components/schemas/User' },
          token: { type: 'string', example: 'jwt-token' }
        }
      },
      Item: {
        type: 'object',
        properties: {
          itemName: { type: 'string', example: 'LEITE INTEGRAL' },
          itemCode: { type: 'string', example: '12345' },
          qtdItem: { oneOf: [{ type: 'string' }, { type: 'number' }] },
          unItem: { type: 'string', example: 'UN' },
          itemValue: { oneOf: [{ type: 'string' }, { type: 'number' }], example: '12.99' }
        }
      },
      NfcePayload: {
        type: 'object',
        required: ['nfce'],
        properties: {
          nfce: {
            type: 'object',
            required: ['items', 'details', 'detailsNfce'],
            properties: {
              items: {
                type: 'array',
                items: { '$ref': '#/components/schemas/Item' }
              },
              details: {
                type: 'object',
                additionalProperties: true
              },
              detailsNfce: {
                type: 'object',
                required: ['accesskey'],
                additionalProperties: true,
                properties: {
                  accesskey: { type: 'string', example: '31260717745613002609650100001981091330127025' }
                }
              }
            }
          }
        }
      },
      Nfce: {
        type: 'object',
        additionalProperties: true
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensagem de erro' }
        }
      },
      CrawlerRequest: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', format: 'uri', example: 'https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=...' }
        }
      }
    }
  },
  tags: [
    { name: 'Auth', description: 'Autenticacao e recuperacao de senha' },
    { name: 'NFC-e', description: 'Operacoes com notas fiscais do usuario autenticado' },
    { name: 'Crawler', description: 'Captura e extracao de dados da NFC-e a partir da URL/QR Code' }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cadastrar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Usuario cadastrado com sucesso',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/AuthResponse' }
              }
            }
          },
          '400': {
            description: 'Falha de validacao ou usuario ja existente',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/auth/authenticate': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/AuthRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Usuario autenticado com sucesso',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/AuthResponse' }
              }
            }
          },
          '400': {
            description: 'Credenciais invalidas',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/auth/forgot_password': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar redefinicao de senha',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ForgotPasswordRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Solicitacao processada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Se o e-mail estiver cadastrado, enviaremos as instrucoes de redefinicao.' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Falha ao solicitar redefinicao de senha',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/auth/reset_password/validate': {
      post: {
        tags: ['Auth'],
        summary: 'Validar token de redefinicao de senha',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ResetPasswordValidateRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Token valido e pronto para uso',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/ResetPasswordValidationResponse' }
              }
            }
          },
          '400': {
            description: 'Token invalido ou expirado',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/auth/reset_password': {
      post: {
        tags: ['Auth'],
        summary: 'Redefinir senha com token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/ResetPasswordRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Senha redefinida com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Senha redefinida com sucesso.' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Token ou payload invalidos',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/auth/{userId}': {
      put: {
        tags: ['Auth'],
        summary: 'Atualizar nome do usuario autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'userId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/UpdateProfileRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Usuario atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { '$ref': '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Token ausente ou invalido',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          },
          '403': {
            description: 'Tentativa de editar outro usuario',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/crawler': {
      post: {
        tags: ['Crawler'],
        summary: 'Extrair dados da NFC-e a partir da URL',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/CrawlerRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Dados da NFC-e extraidos com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nfce: { '$ref': '#/components/schemas/Nfce' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Falha na extracao da NFC-e',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/nfces': {
      get: {
        tags: ['NFC-e'],
        summary: 'Listar todas as NFC-es disponiveis',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nfces: {
                      type: 'array',
                      items: { '$ref': '#/components/schemas/Nfce' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['NFC-e'],
        summary: 'Cadastrar nova NFC-e para o usuario autenticado',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/NfcePayload' }
            }
          }
        },
        responses: {
          '201': {
            description: 'NFC-e cadastrada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nfce: { '$ref': '#/components/schemas/Nfce' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Payload invalido ou NFC-e duplicada',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/nfces/user/{userId}': {
      get: {
        tags: ['NFC-e'],
        summary: 'Listar NFC-es do usuario autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'userId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Lista retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nfces: {
                      type: 'array',
                      items: { '$ref': '#/components/schemas/Nfce' }
                    }
                  }
                }
              }
            }
          },
          '403': {
            description: 'Tentativa de acesso a dados de outro usuario',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/nfces/{nfceId}': {
      get: {
        tags: ['NFC-e'],
        summary: 'Consultar uma NFC-e do usuario autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'nfceId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'NFC-e encontrada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nfce: { '$ref': '#/components/schemas/Nfce' }
                  }
                }
              }
            }
          },
          '403': {
            description: 'Tentativa de acesso a nota de outro usuario',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          },
          '404': {
            description: 'NFC-e nao encontrada',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      },
      put: {
        tags: ['NFC-e'],
        summary: 'Atualizar NFC-e do usuario autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'nfceId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/NfcePayload' }
            }
          }
        },
        responses: {
          '201': {
            description: 'NFC-e atualizada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nfce: { '$ref': '#/components/schemas/Nfce' }
                  }
                }
              }
            }
          },
          '403': {
            description: 'Tentativa de editar nota de outro usuario',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      },
      delete: {
        tags: ['NFC-e'],
        summary: 'Excluir NFC-e do usuario autenticado',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'nfceId',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '204': { description: 'NFC-e removida com sucesso' },
          '403': {
            description: 'Tentativa de excluir nota de outro usuario',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    }
  }
};

module.exports = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: []
});

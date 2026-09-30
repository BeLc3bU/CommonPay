import { describe, it, expect } from 'vitest';
import handler, { generarTokenEditor, esTokenValido, verificarPeticionEditor } from './auth.js';

describe('Autenticación y Tokens HMAC (/api/auth.js)', () => {
  it('debe generar un token con el formato esperado', () => {
    const token = generarTokenEditor();
    expect(token).toBeDefined();
    expect(token.startsWith('cp_')).toBe(true);

    const partes = token.split('_');
    expect(partes).toHaveLength(3);
    expect(partes[0]).toBe('cp');
    expect(Number(partes[1])).toBeGreaterThan(0);
    expect(partes[2]).toHaveLength(64); // SHA-256 hex tiene 64 caracteres
  });

  it('debe validar satisfactoriamente un token recién emitido', () => {
    const token = generarTokenEditor();
    expect(esTokenValido(token)).toBe(true);
  });

  it('debe rechazar tokens manipulados o alterados', () => {
    const token = generarTokenEditor();
    const partes = token.split('_');
    // Alteramos el último carácter del hash HMAC
    const ultimoChar = partes[2].slice(-1);
    const charAlterado = ultimoChar === 'a' ? 'b' : 'a';
    const tokenManipulado = `${partes[0]}_${partes[1]}_${partes[2].slice(0, -1)}${charAlterado}`;

    expect(esTokenValido(tokenManipulado)).toBe(false);
  });

  it('debe rechazar tokens con formato inválido o nulos', () => {
    expect(esTokenValido(null)).toBe(false);
    expect(esTokenValido('')).toBe(false);
    expect(esTokenValido('token_falso')).toBe(false);
    expect(esTokenValido('cp_invalido_hash')).toBe(false);
  });

  it('debe verificar la cabecera Authorization en peticiones HTTP', () => {
    const token = generarTokenEditor();
    const reqValido = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    expect(verificarPeticionEditor(reqValido)).toBe(true);

    const reqSinAuth = { headers: {} };
    expect(verificarPeticionEditor(reqSinAuth)).toBe(false);

    const reqTokenInvalido = {
      headers: {
        authorization: 'Bearer token_invalido'
      }
    };
    expect(verificarPeticionEditor(reqTokenInvalido)).toBe(false);
  });

  it('debe procesar el handler con login correcto y fallido', async () => {
    const mockRes = () => {
      const res = {
        statusCode: 200,
        headers: {},
        jsonData: null,
        setHeader(k, v) {
          res.headers[k] = v;
        },
        status(code) {
          res.statusCode = code;
          return res;
        },
        json(data) {
          res.jsonData = data;
          return res;
        }
      };
      return res;
    };

    // Caso 1: Login con contraseña correcta (por defecto 'pedro123')
    const reqLoginOk = {
      method: 'POST',
      query: { action: 'login' },
      body: JSON.stringify({ password: 'pedro123', email: 'pedro@commonpay.local' }),
      headers: {}
    };
    const resLoginOk = mockRes();
    await handler(reqLoginOk, resLoginOk);

    expect(resLoginOk.statusCode).toBe(200);
    expect(resLoginOk.jsonData.success).toBe(true);
    expect(resLoginOk.jsonData.token).toBeDefined();
    expect(esTokenValido(resLoginOk.jsonData.token)).toBe(true);

    // Caso 2: Login con contraseña errónea
    const reqLoginErr = {
      method: 'POST',
      query: { action: 'login' },
      body: JSON.stringify({ password: 'clave-incorrecta' }),
      headers: {}
    };
    const resLoginErr = mockRes();
    await handler(reqLoginErr, resLoginErr);

    expect(resLoginErr.statusCode).toBe(401);
    expect(resLoginErr.jsonData.error).toBeDefined();

    // Caso 3: Check de sesión con token válido
    const reqCheckOk = {
      method: 'GET',
      query: { action: 'check' },
      headers: {
        authorization: `Bearer ${resLoginOk.jsonData.token}`
      }
    };
    const resCheckOk = mockRes();
    await handler(reqCheckOk, resCheckOk);

    expect(resCheckOk.statusCode).toBe(200);
    expect(resCheckOk.jsonData.isEditor).toBe(true);
  });
});

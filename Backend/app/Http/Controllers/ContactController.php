<?php
// app/Http/Controllers/ContactController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class ContactController extends Controller
{
    public function store(Request $r)
    {
        // 1) Honeypot
        if (trim((string) $r->input('website')) !== '') {
            Log::warning('Honeypot activado en contacto', ['ip' => $r->ip()]);
            return response()->json(['ok' => true]);
        }

        // 2) Validación (esperando SLUG en practice_area)
        $data = $r->validate([
            'name'          => ['required', 'string', 'max:150'],
            'email'         => ['required', 'email', 'max:150'],
            'telefono'      => ['required', 'string', 'max:25', 'regex:/^\+?[0-9()\-\.\s]{7,25}$/'],
            'company'       => ['nullable', 'string', 'max:150'],
            'practice_area' => ['required', Rule::exists('practice_areas', 'slug')],
            'message'       => ['required', 'string', 'max:5000'],
            'consent'       => ['required', 'boolean'],
            'website'       => ['nullable', 'string', 'max:200'], // honeypot
        ]);

        $data['consent'] = (bool) $data['consent'];

        // 3) Resolver título del área a partir del slug
        $area      = DB::table('practice_areas')->where('slug', $data['practice_area'])->first();
        $areaTitle = $area->title ?? $data['practice_area'];

        // 4) Log de entrada
        Log::info('Contacto recibido', [
            'name'    => $data['name'],
            'email'   => $data['email'],
            'company' => $data['company'] ?? null,
            'slug'    => $data['practice_area'],
            'title'   => $areaTitle,
            'ip'      => $r->ip(),
            'ua'      => $r->userAgent(),
        ]);

        // 5) Envío (HTML limpio, sin “Laravel — fecha”)
        try {
            // Helpers de escape
            $h  = fn($v) => e((string) $v);
            $br = fn($v) => nl2br(e((string) $v));

            // Encabezado simple (SIN marca/fecha)
            $html = '
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Nuevo contacto ' . $h($data['name']) . '</title>
</head>
<body style="margin:0;padding:0;background:#f6f8fb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fb;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:94%;background:#ffffff;border-radius:16px;border:1px solid #e6e9ef;box-shadow:0 6px 24px rgba(20,30,55,0.06);">
          <tr>
            <td style="padding:24px 24px 8px;">
              <h1 style="
  margin:0 0 6px;
  text-align:center;
  font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;
  font-size:20px;
  color:#0f172a;
  font-weight:700;
">
  Nuevo contacto
</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 24px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0 8px;">
                <tr>
                  <td style="width:200px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px 0 0 10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#334155;font-weight:600;">
                    Nombre
                  </td>
                  <td style="padding:12px 14px;background:#ffffff;border:1px solid #e2e8f0;border-left:none;border-radius:0 10px 10px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#0f172a;">
                    ' . $h($data['name']) . '
                  </td>
                </tr>
                <tr>
                  <td style="width:200px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px 0 0 10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#334155;font-weight:600;">
                    Email
                  </td>
                  <td style="padding:12px 14px;background:#ffffff;border:1px solid #e2e8f0;border-left:none;border-radius:0 10px 10px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#0f172a;">
                    ' . $h($data['email']) . '
                  </td>
                </tr>
                <tr>
  <td style="width:200px; padding:12px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px 0 0 10px; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; font-size:13px; color:#334155; font-weight:600;">
    Teléfono
  </td>
  <td style="padding:12px 14px; background:#ffffff; border:1px solid #e2e8f0; border-left:none; border-radius:0 10px 10px 0; font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif; font-size:13px; color:#0f172a;">
    ' . $h($data['telefono']) . '
  </td>
</tr>

                <tr>
                  <td style="width:200px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px 0 0 10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#334155;font-weight:600;">
                    Compañía
                  </td>
                  <td style="padding:12px 14px;background:#ffffff;border:1px solid #e2e8f0;border-left:none;border-radius:0 10px 10px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#0f172a;">
                    ' . ($data['company'] ? $h($data['company']) : '<span style="color:#94a3b8;">—</span>') . '
                  </td>
                </tr> 
                <tr>
                  <td style="width:200px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px 0 0 10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#334155;font-weight:600;">
                    Área (título)
                  </td>
                  <td style="padding:12px 14px;background:#ffffff;border:1px solid #e2e8f0;border-left:none;border-radius:0 10px 10px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#0f172a;">
                    ' . $h($areaTitle) . '
                  </td>
                </tr>
                <tr>
                  <td style="width:200px;padding:12px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px 0 0 10px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#334155;font-weight:600;">
                    Consentimiento
                  </td>
                  <td style="padding:12px 14px;background:#ffffff;border:1px solid #e2e8f0;border-left:none;border-radius:0 10px 10px 0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#0f172a;">
                    ' . ($data['consent'] ? 'sí' : 'no') . '
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 24px 24px;">
              <div style="border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;padding:14px;">
                <p style="margin:0 0 8px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:13px;color:#334155;font-weight:600;">
                  Mensaje
                </p>
                <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:14px;color:#0f172a;line-height:1.6;">
                  ' . $br($data['message']) . '
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px 24px;">
              <p style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;font-size:12px;color:#94a3b8;">
                Este correo fue generado automáticamente desde el formulario de contacto.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>';

            $to      = 'contacto@blancoramirezlegal.com';
            $subject = 'Nueva Solicitud de Contacto — ' . $areaTitle;

            Mail::html($html, function ($m) use ($to, $subject, $data) {
                $m->to($to)
                    ->subject($subject)
                    ->replyTo($data['email'], $data['name']); // responder al cliente
            });

            Log::info('Correo de contacto ENVIADO');
            return response()->json(['ok' => true]);
        } catch (TransportExceptionInterface $e) {
            Log::error('Error enviando correo de contacto', ['error' => $e->getMessage()]);
            return response()->json([
                'ok' => false,
                'message' => 'No se pudo enviar el correo (mailer). Revisa configuración.',
            ], 500);
        } catch (\Throwable $e) {
            Log::error('Error inesperado en contacto', ['error' => $e->getMessage()]);
            return response()->json(['ok' => false, 'message' => 'Error inesperado'], 500);
        }
    }
}

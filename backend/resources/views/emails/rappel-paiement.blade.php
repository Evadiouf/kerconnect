<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel de paiement — KerConnect</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif;">

  <div style="max-width:580px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- En-tête -->
    <div style="background:linear-gradient(135deg,#E05C52,#4338CA);padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">KerConnect</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Plateforme immobilière au Sénégal</p>
    </div>

    <!-- Corps -->
    <div style="padding:36px 40px;">

      <p style="margin:0 0 8px;font-size:16px;color:#374151;">Bonjour <strong>{{ $contrat->locataire->name }}</strong>,</p>

      <p style="margin:0 0 24px;font-size:15px;color:#6B7280;line-height:1.6;">
        Nous vous rappelons que votre prochain loyer est dû dans <strong style="color:#E05C52;">3 jours</strong>,
        le <strong>{{ $dateEcheance }}</strong>.
      </p>

      <!-- Récapitulatif -->
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:24px;margin-bottom:28px;">
        <h2 style="margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF;font-weight:600;">Détails du paiement</h2>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6B7280;border-bottom:1px solid #F3F4F6;">Bien</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #F3F4F6;">
              {{ $contrat->bien->titre }}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6B7280;border-bottom:1px solid #F3F4F6;">Contrat</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #F3F4F6;">
              {{ $contrat->numero }}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6B7280;border-bottom:1px solid #F3F4F6;">Date d'échéance</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #F3F4F6;">
              {{ $dateEcheance }}
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;font-size:15px;color:#111827;font-weight:700;">Montant à payer</td>
            <td style="padding:12px 0 0;font-size:20px;color:#E05C52;font-weight:800;text-align:right;">
              {{ number_format($montantDu, 0, ',', ' ') }} FCFA
            </td>
          </tr>
        </table>
      </div>

      @php
        $loyer = number_format($contrat->montant, 0, ',', ' ');
        $commission = number_format($montantDu - $contrat->montant, 0, ',', ' ');
      @endphp
      <p style="margin:0 0 28px;font-size:13px;color:#9CA3AF;line-height:1.5;">
        Ce montant comprend le loyer de base ({{ $loyer }} FCFA)
        et les frais de service KerConnect ({{ $commission }} FCFA).
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/client/demandes"
           style="display:inline-block;background:linear-gradient(135deg,#E05C52,#c0392b);color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
          Accéder à mon espace →
        </a>
      </div>

      <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.5;">
        Si vous avez déjà effectué ce paiement, ignorez cet e-mail.
        Pour toute question, contactez-nous à
        <a href="mailto:contact@naratechvision.com" style="color:#4338CA;">contact@naratechvision.com</a>.
      </p>

    </div>

    <!-- Pied de page -->
    <div style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9CA3AF;">
        © {{ date('Y') }} KerConnect — Naratechvision · Dakar, Sénégal
      </p>
    </div>

  </div>

</body>
</html>

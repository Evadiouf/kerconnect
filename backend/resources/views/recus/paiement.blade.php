<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; color: #1a1a2e; font-size: 12px; padding: 40px; }
  .header { background: #0f3460; color: white; padding: 24px 30px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 22px; font-weight: bold; }
  .header p { font-size: 11px; opacity: 0.8; margin-top: 4px; }
  .badge { background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; }
  .badge.confirme { background: #22c55e; }
  .badge.en_attente { background: #f59e0b; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 13px; font-weight: bold; color: #0f3460; border-bottom: 2px solid #0f3460; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field { margin-bottom: 8px; }
  .field label { font-size: 10px; color: #6b7280; display: block; margin-bottom: 2px; text-transform: uppercase; }
  .field value { font-size: 12px; color: #1a1a2e; font-weight: 500; }
  .amount-box { background: #f0f9ff; border: 2px solid #0f3460; border-radius: 8px; padding: 16px 20px; text-align: center; margin: 20px 0; }
  .amount-box .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
  .amount-box .amount { font-size: 28px; font-weight: bold; color: #0f3460; }
  .amount-box .period { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .reference-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center; margin: 16px 0; }
  .reference-box .ref { font-size: 18px; font-weight: bold; color: #0f3460; letter-spacing: 2px; font-family: monospace; }
  .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 10px; }
  .valid-badge { background: #dcfce7; border: 1px solid #86efac; color: #15803d; padding: 8px 16px; border-radius: 6px; text-align: center; font-weight: bold; font-size: 11px; margin: 16px 0; }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>KerConnect</h1>
    <p>Plateforme Immobilière Digitale — Sénégal</p>
    <p>contact@naratechvision.com</p>
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;opacity:0.8;margin-bottom:6px">REÇU DE PAIEMENT</div>
    <div class="badge {{ $paiement->statut }}">{{ strtoupper($paiement->statut) }}</div>
  </div>
</div>

<!-- Montant -->
<div class="amount-box">
  <div class="label">MONTANT PAYÉ</div>
  <div class="amount">{{ number_format($paiement->montant, 0, ',', ' ') }} FCFA</div>
  @if($paiement->periode)
    <div class="period">{{ $paiement->libelle }} — {{ \Carbon\Carbon::parse($paiement->periode)->format('F Y') }}</div>
  @else
    <div class="period">{{ $paiement->libelle }}</div>
  @endif
</div>

<!-- Référence -->
<div class="reference-box">
  <div style="font-size:10px;color:#6b7280;margin-bottom:4px">RÉFÉRENCE DE TRANSACTION</div>
  <div class="ref">{{ $paiement->reference }}</div>
  @if($paiement->transaction_id)
    <div style="font-size:10px;color:#9ca3af;margin-top:4px">ID: {{ $paiement->transaction_id }}</div>
  @endif
</div>

@if($paiement->statut === 'confirme')
<div class="valid-badge">✓ Paiement validé et enregistré — {{ $paiement->paye_at?->format('d/m/Y à H:i') }}</div>
@endif

<div class="grid">
  <!-- Informations paiement -->
  <div class="section">
    <div class="section-title">Détails du paiement</div>
    <div class="field">
      <label>Mode de paiement</label>
      <value>{{ str_replace('_', ' ', strtoupper($paiement->mode)) }}</value>
    </div>
    <div class="field">
      <label>Date de paiement</label>
      <value>{{ $paiement->paye_at ? $paiement->paye_at->format('d/m/Y') : 'En attente' }}</value>
    </div>
    <div class="field">
      <label>Payeur</label>
      <value>{{ $paiement->payeur->name }}</value>
    </div>
  </div>

  <!-- Bien -->
  <div class="section">
    <div class="section-title">Bien concerné</div>
    <div class="field">
      <label>Titre</label>
      <value>{{ $paiement->contrat->bien->titre ?? 'N/A' }}</value>
    </div>
    <div class="field">
      <label>Adresse</label>
      <value>{{ $paiement->contrat->bien->adresse ?? '' }}, {{ $paiement->contrat->bien->ville ?? '' }}</value>
    </div>
    <div class="field">
      <label>Nature</label>
      <value>{{ ucfirst($paiement->contrat->type) }}</value>
    </div>
  </div>
</div>

<div class="grid">
  <!-- Bailleur -->
  <div class="section">
    <div class="section-title">Bailleur</div>
    <div class="field">
      <label>Nom</label>
      <value>{{ $paiement->contrat->bailleur->name }}</value>
    </div>
    <div class="field">
      <label>Email</label>
      <value>{{ $paiement->contrat->bailleur->email }}</value>
    </div>
  </div>

  <!-- Locataire / Acheteur -->
  <div class="section">
    <div class="section-title">Locataire / Acheteur</div>
    <div class="field">
      <label>Nom</label>
      <value>{{ $paiement->contrat->locataire->name }}</value>
    </div>
    <div class="field">
      <label>Email</label>
      <value>{{ $paiement->contrat->locataire->email }}</value>
    </div>
  </div>
</div>

<!-- Contrat -->
<div class="section">
  <div class="section-title">Informations du contrat</div>
  <div class="grid">
    <div class="field">
      <label>N° Contrat</label>
      <value>{{ $paiement->contrat->numero }}</value>
    </div>
    <div class="field">
      <label>Montant contrat</label>
      <value>{{ number_format($paiement->contrat->montant, 0, ',', ' ') }} FCFA</value>
    </div>
    @if($paiement->contrat->date_debut)
    <div class="field">
      <label>Début bail</label>
      <value>{{ \Carbon\Carbon::parse($paiement->contrat->date_debut)->format('d/m/Y') }}</value>
    </div>
    @endif
    @if($paiement->contrat->date_fin)
    <div class="field">
      <label>Fin bail</label>
      <value>{{ \Carbon\Carbon::parse($paiement->contrat->date_fin)->format('d/m/Y') }}</value>
    </div>
    @endif
  </div>
</div>

<div class="footer">
  <p>Ce reçu est généré automatiquement par KerConnect — Naratechvision © 2026</p>
  <p style="margin-top:4px">Ce document constitue une preuve de paiement valide.</p>
  <p style="margin-top:4px">Généré le {{ now()->format('d/m/Y à H:i') }}</p>
</div>

</body>
</html>

<?php

namespace App\Mail;

use App\Models\Contrat;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RappelPaiementMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Contrat $contrat,
        public string $dateEcheance,
        public float  $montantDu,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Rappel : votre loyer est dû le {$this->dateEcheance}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rappel-paiement',
        );
    }
}

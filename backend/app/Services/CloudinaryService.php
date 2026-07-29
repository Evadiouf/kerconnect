<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key'    => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
            'url' => ['secure' => true],
        ]);
    }

    // Upload un fichier et retourne l'URL Cloudinary sécurisée
    public function upload(UploadedFile $file, string $folder): string
    {
        $result = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder'        => "kerconnect/{$folder}",
                'resource_type' => 'auto',
            ]
        );

        return $result['secure_url'];
    }

    // Supprime un fichier à partir de son URL Cloudinary
    public function delete(string $url): void
    {
        // Extraire le public_id depuis l'URL
        // Format : https://res.cloudinary.com/{cloud}/image/upload/v{ver}/{public_id}.{ext}
        if (preg_match('/\/(?:image|video|raw)\/upload\/(?:v\d+\/)?(.+)\.\w+$/', $url, $matches)) {
            try {
                $this->cloudinary->uploadApi()->destroy($matches[1]);
            } catch (\Exception $e) {
                \Log::warning("Cloudinary delete échoué pour {$url} : " . $e->getMessage());
            }
        }
    }

    // Supprime plusieurs fichiers
    public function deleteMany(array $urls): void
    {
        foreach ($urls as $url) {
            if ($url && str_starts_with($url, 'https://')) {
                $this->delete($url);
            }
        }
    }
}

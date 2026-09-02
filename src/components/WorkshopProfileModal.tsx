import { useState, useEffect, useRef, FormEvent, ChangeEvent, DragEvent } from 'react';
import { WorkshopProfile } from '../types';
import { 
  Settings, 
  X, 
  Save, 
  Building2, 
  Phone, 
  QrCode, 
  MapPin, 
  ShieldCheck, 
  Tag, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface WorkshopProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: WorkshopProfile;
  onSave: (updated: WorkshopProfile) => void;
}

export function WorkshopProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: WorkshopProfileModalProps) {
  const [formData, setFormData] = useState<WorkshopProfile>(profile);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setUploadError(null);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const currentLogo = formData.logoUrl || '/icon.svg';
  const hasCustomLogo = Boolean(formData.logoUrl && formData.logoUrl !== '/icon.svg');

  // Process file to optimized base64 image
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WEBP).');
      return;
    }

    setUploadError(null);

    // If SVG, read as data url directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // For other images, downscale/optimize with canvas so it stores smoothly in localStorage
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
        }
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleResetLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4.5 flex items-center justify-between border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-red-900/50 p-0.5 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={currentLogo}
                alt="Logo Atual"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Dados da Sua Serralheria</h3>
              <p className="text-xs text-zinc-400">Personalize o logotipo, cabeçalho e propostas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Logotipo da Serralheria / Upload */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                <span>Logotipo da Serralheria</span>
              </label>
              {hasCustomLogo && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="text-[11px] font-bold text-zinc-600 hover:text-red-600 flex items-center gap-1 transition cursor-pointer bg-white px-2 py-0.5 rounded-md border border-zinc-200 shadow-2xs"
                  title="Voltar para o logotipo padrão LW"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Padrão</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5">
              {/* Preview Box */}
              <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-black border-2 border-zinc-800 shadow-md p-1 flex items-center justify-center shrink-0 overflow-hidden group">
                <img
                  src={currentLogo}
                  alt="Logo Preview"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
                {hasCustomLogo && (
                  <span className="absolute bottom-1 right-1 bg-emerald-500 w-3 h-3 rounded-full border-2 border-black" title="Logo personalizada ativa" />
                )}
              </div>

              {/* Upload Drop Zone / Input */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                  isDragging
                    ? 'border-red-500 bg-red-50/80 text-red-700'
                    : 'border-zinc-300 hover:border-red-400 bg-white hover:bg-zinc-50/80 text-zinc-600'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                  <Upload className="w-4 h-4 text-red-600" />
                  <span>{hasCustomLogo ? 'Trocar Logotipo' : 'Enviar Nova Imagem de Logo'}</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Clique ou arraste uma foto (PNG, JPG, SVG). Será aplicada em todo o app.
                </p>
              </div>
            </div>

            {uploadError && (
              <p className="text-[11px] text-red-600 font-semibold mt-2">
                {uploadError}
              </p>
            )}
          </div>

          {/* Nome da Oficina */}
          <div>
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span>Nome da Serralheria / Oficina</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: LW Serralheria & Estruturas Metálicas"
              required
              className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Descrição / Subtítulo / Especialidades da Oficina */}
          <div>
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 mb-1">
              <Tag className="w-3.5 h-3.5 text-red-600" />
              <span>Descrição / Subtítulo / Especialidades</span>
            </label>
            <input
              type="text"
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ex: Estruturas Metálicas • Esquadrias de Ferro • Serralheria em Geral"
              className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Exibido no topo do aplicativo e abaixo do nome da oficina na proposta para impressão / PDF.
            </p>
          </div>

          {/* Telefone / WhatsApp */}
          <div>
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 mb-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Seu Telefone / WhatsApp Comercial</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 98765-4321"
              className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm font-semibold text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Chave PIX */}
          <div>
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 mb-1">
              <QrCode className="w-3.5 h-3.5 text-red-600" />
              <span>Chave PIX para Pagamentos</span>
            </label>
            <input
              type="text"
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              placeholder="CNPJ, E-mail, Celular ou Chave Aleatória"
              className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm font-mono text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Cidade / Estado */}
          <div>
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>Cidade / Estado da Oficina</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ex: São Paulo - SP"
              className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Termos de Garantia */}
          <div>
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
              <span>Texto Padrão de Garantia</span>
            </label>
            <input
              type="text"
              value={formData.warranty}
              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              placeholder="Ex: 90 dias contra defeitos de fabricação e solda"
              className="w-full px-3 py-2 border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-950/20 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Dados</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

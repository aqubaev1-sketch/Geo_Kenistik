import { PageIntro } from '@/components/platform/PageIntro';
import { CubeLaboratory } from '@/components/laboratory/CubeLaboratory';

export default function LaboratoryPage() {
  return (
    <main className="container min-h-screen pb-24 pt-32">
      <PageIntro
        eyebrow="Интерактивті тәжірибе"
        title="Геометриялық зертхана"
        description="Модельді қолмен басқарып, кеңістіктегі дене мен оның жазбасы арасындағы байланысты зерттеңіз."
      />
      <CubeLaboratory />
    </main>
  );
}

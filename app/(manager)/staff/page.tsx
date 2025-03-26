import StaffPageContent from '@/components/Private/StaffPageContent';
import { generateMetadata } from '@/lib/utils';

export const metadata = generateMetadata({
  title: 'Staff Panel',
  description:
    'A streamlined page for Staff, and let staff easily manage any data for smooth operations.',
});
export default function StaffPage() {
  return <StaffPageContent />;
}

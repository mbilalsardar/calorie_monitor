
import { getData } from '@/app/data-actions';
import MainApp from '@/components/MainApp';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { history, userSettings } = await getData();

  return <MainApp initialHistory={history} initialSettings={userSettings} />;
}

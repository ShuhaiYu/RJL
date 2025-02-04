// UserProfileHero.jsx
import { KeenIcon } from '@/components';
import { Container } from '@/components/container';
import { toAbsoluteUrl } from '@/utils';
import { useSettings } from '@/providers';

const UserProfileHero = ({ image, name, info }) => {
  const { getThemeMode } = useSettings();

  const buildInfo = (infoItems) => {
    return infoItems.map((item, index) => {
      <div className="flex gap-2 items-center" key={`info-${index}`}>
        {item.icon && <KeenIcon icon={item.icon} className="text-gray-500 text-sm" />}
        <span className="text-gray-600 font-medium">{item.info}</span>
      </div>
    });
  };

  return (
    <div
      className="bg-center bg-cover bg-no-repeat hero-bg"
      style={{
        backgroundImage:
          getThemeMode() === 'dark'
            ? `url('${toAbsoluteUrl('/media/images/2600x1200/bg-1-dark.png')}')`
            : `url('${toAbsoluteUrl('/media/images/2600x1200/bg-1.png')}')`,
      }}
    >
      <Container>
        <div className="flex flex-col items-center gap-3 py-4 lg:pt-5 lg:pb-10">
          {image}
          <div className="text-lg font-semibold text-gray-900">{name}</div>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {buildInfo(info)}
          </div>
        </div>
      </Container>
    </div>
  );
};

export { UserProfileHero };

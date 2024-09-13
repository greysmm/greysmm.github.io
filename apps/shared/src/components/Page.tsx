import GmmLogo from "../assets/gmm_logo.svg";

type Props = React.ComponentProps<"div"> & {
  children: React.ReactNode;
};

const NavBar = () => {
  const locArr: { icon?: any; label?: string; link: string }[] = [
    { label: "Projects", link: "/projects" },
    { label: "About", link: "/about" },
  ];
  return (
    <div className="flex p-4 border border-white">
      <a href="https://github.com/greysmm/greysmm.github.io">
        <img
          src={GmmLogo}
          width={270}
          height={75}
          alt="Grey's Magnificent Monorepo"
        />
      </a>
      <div className="flex justify-end w-full mt-5">
        {locArr.map((item, index) => (
          <a className="mr-10" key={"navitem_" + index} href={item.link}>
            {item.label && <div>{item.label}</div>}
          </a>
        ))}
      </div>
    </div>
  );
};

export const Page = ({ children, ...props }: Props) => {
  return (
    <div>
      <NavBar />
      <div className="p-4 text-center" {...props}>
        {children}
      </div>
    </div>
  );
};

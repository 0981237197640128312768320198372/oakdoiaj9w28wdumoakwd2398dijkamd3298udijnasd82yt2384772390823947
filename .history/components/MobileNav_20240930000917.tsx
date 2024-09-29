/* eslint-disable @typescript-eslint/no-unused-vars */
import { navButtons } from "@/constant"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CiMenuBurger } from "react-icons/ci"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

const MobileNav = () => {
  const path = usePathname()
  return (
    <Drawer>
      <DrawerTrigger className='xl:hidden dark:hover:bg-white/10 hover:bg-black/5 p-2 focus:outline-none focus:ring-0 dark:focus:bg-gray-800'>
        <CiMenuBurger className='duration-500 text-dark-800 dark:text-primary text-3xl' />
      </DrawerTrigger>
      <DrawerContent className='bg-gray-200 dark:bg-dark-600 border-none px-5 pb-5 gap-10 focus:outline-none focus:ring-0'>
        <div className='grid grid-cols-2 w-full h-fit gap-1'>
          {navButtons.map((nav, i) => (
            <Link
              href={nav.url}
              key={i}
              className={`dark:text-gray-400 w-full flex justify-start items-start h-12 md:text-sm font-medium group duration-200 p-2 ${
                path === nav.url
                  ? "font-black transition-transform duration-700 "
                  : ""
              }${
                path === nav.url
                  ? " dark:text-primary text-primary bg-primary/20"
                  : " hover:dark:text-primary hover:text-primary hover:bg-primary/20"
              }`}
            >
              {nav.title}
            </Link>
          ))}
        </div>
        <div className='flex flex-col justify-start items-start'>
          <p className='font-mono text-xs tracking-widest text-white/70'>
            Watch MORE Series, Spend LESS MONEY!
          </p>
          <span className='font-aktivGroteskBold text-4xl pt-1 __stroke'>
            DOKMAI STORE
          </span>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default MobileNav

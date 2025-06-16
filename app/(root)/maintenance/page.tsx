/* eslint-disable @typescript-eslint/no-unused-vars */
import { GrVmMaintenance } from 'react-icons/gr';

const Maintenance = () => {
  return (
    <div className="fixed top-0 left-0 z-[100] w-screen h-screen flex flex-col justify-center items-center bg-dark-800">
      <div className="relative flex flex-col items-center justify-center gap-3">
        <GrVmMaintenance size={70} />
      </div>
      <p className="mt-2">We are Under Maintenance</p>
    </div>
  );
};

export default Maintenance;

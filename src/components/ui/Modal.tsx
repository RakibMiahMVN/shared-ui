import * as Dialog from "@radix-ui/react-dialog";
import * as Portal from "@radix-ui/react-portal";
import clsx from "clsx";
import React from "react";
import { X } from "lucide-react";

type ModalState = {
  portalRef?: any;
  isLargeModal?: boolean;
  isXLargeModal?: boolean;
};

export const ModalContext = React.createContext<ModalState>({
  portalRef: undefined,
  isLargeModal: true,
  isXLargeModal: false,
});

export type ModalProps = {
  isLargeModal?: boolean;
  isXLargeModal?: boolean;
  handleClose: () => void;
  open?: boolean;
  children?: React.ReactNode;
};

type ModalChildProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

type ModalHeaderProps = {
  handleClose: () => void;
  children?: React.ReactNode;
  className?: string;
};

type ModalType = React.FC<ModalProps> & {
  Body: React.FC<ModalChildProps>;
  Header: React.FC<ModalHeaderProps>;
  Footer: React.FC<ModalChildProps>;
  Content: React.FC<ModalChildProps>;
};

const Overlay: React.FC<React.PropsWithChildren> = () => {
  return (
    <Dialog.Overlay className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm" />
  );
};

const Content: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Portal.Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Content className="relative max-h-full w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
          {children}
        </Dialog.Content>
      </div>
    </Portal.Portal>
  );
};

const Modal: ModalType = ({
  open = false,
  handleClose,
  children,
  isLargeModal = true,
  isXLargeModal = false,
}: ModalProps) => {
  return (
    <ModalContext.Provider value={{ isLargeModal, isXLargeModal }}>
      <Dialog.Root open={open} onOpenChange={handleClose}>
        <Overlay />
        <Content>{children}</Content>
      </Dialog.Root>
    </ModalContext.Provider>
  );
};

const Header: React.FC<ModalHeaderProps> = ({
  handleClose,
  children,
  className,
}) => {
  return (
    <div className={clsx("flex items-center justify-between p-6", className)}>
      {children}
      <button
        onClick={handleClose}
        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

const Body: React.FC<ModalChildProps> = ({ children, className, style }) => {
  return (
    <div className={clsx("p-6", className)} style={style}>
      {children}
    </div>
  );
};

const Footer: React.FC<ModalChildProps> = ({ children, className, style }) => {
  return (
    <div className={clsx("p-6", className)} style={style}>
      {children}
    </div>
  );
};

const ContentWrapper: React.FC<ModalChildProps> = ({
  children,
  className,
  style,
}) => {
  return (
    <div className={clsx("p-6", className)} style={style}>
      {children}
    </div>
  );
};

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.Content = ContentWrapper;

export default Modal;

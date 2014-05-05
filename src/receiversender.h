#ifndef RECEIVERSENDER_H
#define RECEIVERSENDER_H

namespace fskube {

template <class InType> class Receiver {
    public:
        virtual ~Receiver() {};
        virtual void receive(InType in) = 0;
};

template <class OutType> class Sender {
    protected:
        void send(OutType out) {
            if(nextReceiver) {
                nextReceiver->receive(out);
            }
        }
    private:
        Receiver<OutType> *nextReceiver = 0;
    public:
        virtual ~Sender() {};
        void connect(Receiver<OutType> *next) {
            nextReceiver = next;
        }
};

}

#endif // RECEIVERSENDER_H

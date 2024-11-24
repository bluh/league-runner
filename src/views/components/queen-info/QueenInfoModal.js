import React from "react";
import PropTypes from "prop-types";
import queenServices from "../../services/queen";
import { Descriptions, Empty, Modal, Spin } from "antd";
import Icon, { CloudOutlined, FacebookOutlined, GlobalOutlined, InstagramOutlined, TwitterOutlined } from "@ant-design/icons";

const SocialIcons = {
  1: TwitterOutlined,
  2: InstagramOutlined,
  3: GlobalOutlined,
  4: CloudOutlined,
  5: FacebookOutlined
}

class QueenInfoModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      queenData: {}
    }
  }

  componentDidUpdate(prevProps) {
    const { queenID, showing } = this.props;
    if (prevProps.showing === showing || prevProps.queenID === queenID) {
      return;
    }

    this.setState({
      loading: true
    });

    queenServices.getQueenDetails(queenID)
      .then(data => {
        console.log(data);
        this.setState({
          queenData: data
        })
      })
      .finally(() => {
        this.setState({
          loading: false
        });
      });
  }

  render() {
    const { queenData } = this.state;
    const { Name, Pronouns, Hometown, SocialMedia } = queenData;

    const noDetails = !Pronouns && !Hometown && (!SocialMedia || SocialMedia.length === 0);

    return (
      <Modal
        open={this.props.showing}
        cancelButtonProps={{
          hidden: true
        }}
        onOk={this.props.onClose}
        onCancel={this.props.onClose}
        title={Name}
      >
        <Spin
          spinning={this.state.loading}
        >
          {noDetails ? (
            <Empty description="No details for this queen!" />
          ) : (
            <>
              <Descriptions title="Queen Info" bordered layout="vertical">
                {Pronouns && (<Descriptions.Item label="Pronouns">{Pronouns}</Descriptions.Item>)}
                {Hometown && (<Descriptions.Item label="Hometown">{Hometown}</Descriptions.Item>)}
              </Descriptions>
              {SocialMedia && SocialMedia.length > 0 && (
                <Descriptions bordered layout="vertical">
                  <Descriptions.Item label="Social Media">
                    {SocialMedia.map(media => (
                      <div key={media.ID}>
                        <div style={{ fontWeight: "bold" }}>
                          <Icon component={SocialIcons[media.ID]} />
                          {media.Name}:
                        </div>
                        <a href={media.URL} target="_blank" rel="noreferrer">{media.URL}</a>
                      </div>
                    ))}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </>
          )}
        </Spin>
      </Modal>
    )
  }

}

QueenInfoModal.propTypes = {
  showing: PropTypes.bool,
  queenID: PropTypes.number,
  onClose: PropTypes.func,
}

QueenInfoModal.defaultProps = {
  showing: false,
  queenID: 0,
  onClose: () => { }
}

export default QueenInfoModal;